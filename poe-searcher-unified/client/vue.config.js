module.exports = {
	// https://medium.com/bb-tutorials-and-thoughts/how-to-develop-and-build-vue-js-app-with-nodejs-bd86feec1a20
	devServer: {
		// https://cli.vuejs.org/config/#devserver-proxy
		// If your frontend app and the backend API server are not running on the same host, 
		// you will need to proxy API requests to the API server during development. 
		// This is configurable via the devServer.proxy option in vue.config.js.
		proxy: {
			'^/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
		}
	}
}