import {ApplyError, ListenToForm} from "../../modules/component/Tool.js";
import Authentication from "../../modules/app/Authentication.js";


function Init() {
    const form = document.querySelector("form.form-control");
    const AUTHENTICATION = new Authentication(1);
    const inputs = form.querySelectorAll("input");
    ListenToForm(form, function (data) {
        AUTHENTICATION.Login(data.username, data.password).then((res)=> {
            console.log(res)
            if (res.code === 200) {
                location.replace("/portal/")
            } else {
                ApplyError(res.body.errors, inputs);

                alert(res.message)
            }
        })
    })
}

Init();