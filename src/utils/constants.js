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
        case Contants.BOOKING_STATUS.WAITING_APPROVE:
            return 'noti_message_waiting';
        case Contants.BOOKING_STATUS.APPROVED:
            return 'noti_message_approved';
        case Contants.BOOKING_STATUS.COMPLETED:
            return 'noti_message_completed';
        case Contants.BOOKING_STATUS.REJECTED:
            return 'noti_message_rejected';
        case Contants.BOOKING_STATUS.CANCELLED:
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

module.exports = Constants;