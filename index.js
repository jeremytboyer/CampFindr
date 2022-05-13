if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const session = require('express-session')
const ExpressError = require('./utils/ExpressError')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoDBStore = require('connect-mongo')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
// 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('Database connected!')
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended : true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());
app.use(helmet({contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoDBStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
})

store.on('error', function(e) {
  console.log('Store Error')
})

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.success = req.flash('success')
  res.locals.error =  req.flash('error')
  next()
})

app.get('/fakeUser', async (req, res) => {
  const user = new User({email: 'jerm@gmail.com', username: 'jerm'})
  const newUser = await User.register(user, 'chicken')
  res.send(newUser)
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.listen(3000, () => {
  console.log('Serving on port 3000')
});

app.get('/', (req, res) => {
  res.render('home')
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
  const {statusCode = 500} = err
  if(!err.message) err.message = 'Oh no, something went wrong'
  res.status(statusCode).render('error', {err})
})
