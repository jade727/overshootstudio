import {Ajax, ToData} from "../component/Tool.js";

export class Authentication {
    constructor(user_type) {
        this.user_type = user_type;
    }

    Login(username, password) {
        return new Promise((resolve, reject) => {
            Ajax({
                url: "/api/auth/login",
                type: "POST",
                data: ToData({username, password, user_type: this.user_type}),
                success: (res) => {
                    console.log(res)
                    try {
                         resolve(JSON.parse(res));
                    } catch (e) {
                        reject(res.message);
                    }
                }
            })
        })
    }

    Register(data) {
        return new Promise((resolve, reject) => {
            Ajax({
                url: "/api/auth/register",
                type: "POST",
                data: ToData({data: JSON.stringify({...data, user_type: this.user_type}), user_type: this.user_type}),
                success: (res) => {
                    console.log(res)
                    try {
                        resolve(JSON.parse(res));
                    } catch (e) {
                        reject(res.message);
                    }
                }
            })
        })
    }
}

export default Authentication;