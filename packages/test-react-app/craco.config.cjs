module.exports = {
    babel: {
        plugins: ["@babel/plugin-syntax-import-assertions"]
    },
    resolve: {
        fallback: {
          "vm": false
        }
      }
}