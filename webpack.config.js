const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		index: path.resolve('src/index.js'),
	},
	output: {
		path: path.resolve(__dirname, "dist")
	},
	watch: true,
	module: {
		rules: [{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: {
					presets: ["@babel/preset-react", "@babel/env"],
					plugins: [
						["@babel/plugin-proposal-class-properties", {
							"loose": true
						}],
						["@babel/plugin-transform-object-assign"]
					]
				}
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}
		]
	}
};
