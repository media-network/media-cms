import { redirectIfUnauthenticated } from 'middlewares/auth'
import { systemInfo, reIndex } from './controllers/dashboard'
import {
  list as renderMediaList
} from './controllers/media'
import {
  render as renderSetting,
  update as updateSetting
} from './controllers/setting'

const requiresLogin = redirectIfUnauthenticated('/admin/login')

export default app => {
  app.get('/login', (req, res) => res.render('login'))
  app.get('/logout', (req, res, next) => {
    req.logout();

    res.redirect('/admin/login');
  })

  app.get('/', requiresLogin, systemInfo())
  app.get('/re-index', requiresLogin, reIndex())

  app.get('/upload', requiresLogin, (req, res) => res.render('upload'))

  app.route('/setting')
    .get(requiresLogin, renderSetting())
    .post(requiresLogin, updateSetting())

  app.get('/media', renderMediaList())

  return app
}
