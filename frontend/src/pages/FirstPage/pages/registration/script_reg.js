import '../../../../connections/hystModal/hystmodal.min'
import '../../../../connections/hystModal/hystmodal.min.css'
import './style_reg.css'

const registrationModal = new HystModal({
    linkAttributeName: "data-hystmodal",
    //настройки, см. API
});

const submitButton = document.querySelector('[type="submit"]');