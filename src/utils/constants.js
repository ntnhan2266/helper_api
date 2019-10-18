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

Contants.BOOKING_STATUS = BOOKING_STATUS;
Contants.ROLE = ROLE;

module.exports = Contants;