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

Constants.TRANSATION_STATUS = {
    WAITING: 1,
    PAID: 2
};

module.exports = Constants;