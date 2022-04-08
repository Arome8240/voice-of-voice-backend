const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const fileupload = require('express-fileupload')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const compression = require('compression');

const errorHandler = require('./middleware/error')

const DBConnection = require('./config/db')

dotenv.config({ path: './config/.env' })

DBConnection()

const authRoutes = require('./routes/auth')
const postRoutes = require('./routes/post')

const app = express()

app.use(express.json())

app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Sanitize data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

//Compression
app.use(compression())

// Prevent XSS attacks
app.use(xss())

// Enable CORS
app.use(cors({
  origin: '*',
  credentials:true,         //access-control-allow-credentials:true
  optionSuccessStatus:200
}))

app.options('*', cors()) // include before other routes

//app.use(cors())

/*app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
  res.header('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, Content-Type, Authorization')
  next()
})*/

// Prevent http param pollution
app.use(hpp())

app.use(express.static(path.join(__dirname, 'public')))
app.use('/static', express.static(path.join(__dirname, 'static')))

const versionOne = (routeName) => `/api/v1/${routeName}`
app.use(versionOne('auth'), authRoutes)
app.use(versionOne('post'), postRoutes)

app.use(errorHandler)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(
    `We are live on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red)
  // Close server & exit process
  server.close(() => process.exit(1))
})
