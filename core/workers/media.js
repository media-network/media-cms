const aws = require('aws-sdk');
const bluebird = require('bluebird');
const fs = require('fs');
const mime = require('mime');

module.exports = function(queue, shared, models, config) {
	aws.config.update(config.s3);
	aws.config.setPromisesDependency(bluebird);

	const s3 = new aws.S3(config.s3);

	models.Media.count({}).then(total => {
		shared.mediaCount = total;
	});

	const host = config.assetHost || `https://s3${config.s3.region === 'us-east-1' ? '' : `-${config.s3.region}`}.amazonaws.com/${config.s3.bucket}`;

	queue.process('media', function(job, done) {
		var contentType = mime.lookup(job.data.path);

		let s3Object = {
			Bucket: config.s3.bucket,
			Key: job.data.name,
			Body: fs.createReadStream(job.data.path),
			ContentType: contentType,
			ContentDisposition: 'attachment; filename=' + job.data.name,
			CacheControl: `max-age=${30 * 24 * 60 * 60}`
		};

		// TODO set schedule for remove uploaded file
		s3.putObject(s3Object)
			.promise()
			.then(result => {
				return `${host}/${job.data.name}`;
			})
			.then(onlinePath => {
				let media = new models.Media({
					path: onlinePath,
					storage: 'cloud',
					alias: shared.mediaCount
				});

				return media.save();
			})
			.then(media => {
				shared.mediaCount++;
			})
			.finally(() => done());;
	});
};