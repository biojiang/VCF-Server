/**
 * Admin/User.js
 */
module.exports = {
	tableName: 'Web_users',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	attributes: {
		name: {
			type: 'string',
			unique: true,
			primaryKey: true,
			columnName: 'Name'
		},
		password: {
			type: 'string',
			columnName: 'password'
		},
		authorization: {
			type: 'integer',
			columnName: 'Authorization'
		},
		email: {
			type: 'string',
			columnName: 'Email'
		}
	},

	/**
	 * 密码修改验证
	 * @return {[type]} [description]
	 */
	pwdValidate: function(inputs) {
		var validationErrors = {};
		if (!inputs.password) {
			validationErrors.password = "不能为空!";
		}
		if (inputs.password.length > 20) {
			validationErrors.password = "长度不能超过20!";
		}

		if (!inputs.newpassword) {
			validationErrors.newpassword = "不能为空!";
		}
		if (inputs.newpassword.length > 20) {
			validationErrors.newpassword = "长度不能超过20!";
		}

		if (!inputs.repeat_newpassword) {
			validationErrors.repeat_newpassword = "不能为空!";
		}
		if (inputs.repeat_newpassword.length > 20) {
			validationErrors.repeat_newpassword = "长度不能超过20!";
		}
		if (inputs.repeat_newpassword !== inputs.newpassword) {
			validationErrors.repeat_newpassword = "两次输入的新密码不一致!";
		}
		return validationErrors;
	}
};