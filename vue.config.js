module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
                    ? '/pdf-calendar-generator/'
                    : '/'
}
