import {ListenToForm} from "../../modules/component/Tool.js";
import Authentication from "../../modules/app/Authentication.js";


function Init() {
    const form = document.querySelector("form.form-control");
    const AUTHENTICATION = new Authentication(1);

    ListenToForm(form, function (data) {
        AUTHENTICATION.Register(data).then((res) => {
            console.log(res)
        })
    })
}

Init();