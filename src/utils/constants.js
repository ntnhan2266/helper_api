const Constants = {};

Constants.BOOKING_STATUS = {
	WAITING_APPROVE: 1,
	APPROVED: 2,
	COMPLETED: 3,
	CANCELLED: 4,
	REJECTED: 5
};

Constants.ROLE = {
	ADMIN: 2,
	STANDARD: 1
};

Constants.MESSAGE = (status) => {
	switch (status) {
		case Constants.BOOKING_STATUS.WAITING_APPROVE:
			return 'noti_message_waiting';
		case Constants.BOOKING_STATUS.APPROVED:
			return 'noti_message_approved';
		case Constants.BOOKING_STATUS.COMPLETED:
			return 'noti_message_completed';
		case Constants.BOOKING_STATUS.REJECTED:
			return 'noti_message_rejected';
		case Constants.BOOKING_STATUS.CANCELLED:
			return 'noti_message_canceled';
		default: return '';
	}
};

Constants.TRANSATION_STATUS = {
	WAITING: 1,
	PAID: 2
};

Constants.LITERACY = {
	OTHER: 1,
	HIGH_SCHOOL: 2,
	UNIVERSITY: 3,
	COLLEGE: 4,
	POST_GRADUATE: 5
};

Constants.characterMap = {
	"Á": "A",
	"À": "A",
	"Ả": "A",
	"Ã": "A",
	"Ạ": "A",

	"Ă": "A",
	"Ắ": "A",
	"Ằ": "A",
	"Ẳ": "A",
	"Ẵ": "A",
	"Ặ": "A",

	"Â": "A",
	"Ấ": "A",
	"Ầ": "A",
	"Ẩ": "A",
	"Ẫ": "A",
	"Ậ": "A",

	"Đ": "D",

	"É": "E",
	"È": "E",
	"Ẻ": "E",
	"Ẽ": "E",
	"Ẹ": "E",

	"Ê": "E",
	"Ế": "E",
	"Ề": "E",
	"Ể": "E",
	"Ễ": "E",
	"Ệ": "E",

	"Í": "I",
	"Ì": "I",
	"Ỉ": "I",
	"Ĩ": "I",
	"Ị": "I",

	"Ó": "O",
	"Ò": "O",
	"Ỏ": "O",
	"Õ": "O",
	"Ọ": "O",

	"Ô": "O",
	"Ố": "O",
	"Ồ": "O",
	"Ổ": "O",
	"Ỗ": "O",
	"Ộ": "O",

	"Ơ": "O",
	"Ớ": "O",
	"Ờ": "O",
	"Ở": "O",
	"Ỡ": "O",
	"Ợ": "O",

	"Ú": "U",
	"Ù": "U",
	"Ủ": "U",
	"Ũ": "U",
	"Ụ": "U",

	"Ư": "U",
	"Ứ": "U",
	"Ừ": "U",
	"Ử": "U",
	"Ữ": "U",
	"Ự": "U",

	"Ý": "Y",
	"Ỳ": "Y",
	"Ỷ": "Y",
	"Ỹ": "Y",
	"Ỵ": "Y",

	"á": "a",
	"à": "a",
	"ả": "a",
	"ã": "a",
	"ạ": "a",

	"ă": "a",
	"ắ": "a",
	"ằ": "a",
	"ẳ": "a",
	"ẵ": "a",
	"ặ": "a",

	"â": "a",
	"ấ": "a",
	"ầ": "a",
	"ẩ": "a",
	"ẫ": "a",
	"ậ": "a",

	"đ": "d",

	"é": "e",
	"è": "e",
	"ẻ": "e",
	"ẽ": "e",
	"ẹ": "e",

	"ê": "e",
	"ế": "e",
	"ề": "e",
	"ể": "e",
	"ễ": "e",
	"ệ": "e",

	"í": "i",
	"ì": "i",
	"ỉ": "i",
	"ĩ": "i",
	"ị": "i",

	"ó": "o",
	"ò": "o",
	"ỏ": "o",
	"õ": "o",
	"ọ": "o",

	"ô": "o",
	"ố": "o",
	"ồ": "o",
	"ổ": "o",
	"ỗ": "o",
	"ộ": "o",

	"ơ": "o",
	"ớ": "o",
	"ờ": "o",
	"ở": "o",
	"ỡ": "o",
	"ợ": "o",

	"ú": "u",
	"ù": "u",
	"ủ": "u",
	"ũ": "u",
	"ụ": "u",

	"ư": "u",
	"ứ": "u",
	"ừ": "u",
	"ử": "u",
	"ữ": "u",
	"ự": "u",

	"ý": "y",
	"ỳ": "y",
	"ỷ": "y",
	"ỹ": "y",
	"ỵ": "y",
};

module.exports = Constants;