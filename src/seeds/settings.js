const Setting = require('../models/setting');

initSetting = () => {
    const setting = new Setting();
    setting.daysToReview = 3;
    setting.save();
}

Setting.findOne({},function(err,doc){
    if(!doc){
       // Collection is empty
       // Init setting
       initSetting();
    }
});