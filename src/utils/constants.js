const Contants = {};

const BOOKING_STATUS = {
    WAITING_APPROVE: 1,
    APPROVED: 2,
    COMPLETED: 3,
    CANCELLED: 4,
    REJECTED: 5
};

const ROLE = {
    ADMIN: 2,
    STANDARD: 1
}

const statusToMessage = (status) => {
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
}

Contants.BOOKING_STATUS = BOOKING_STATUS;
Contants.ROLE = ROLE;
Contants.MESSAGE = statusToMessage;

module.exports = Contants;