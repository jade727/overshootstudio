import {AddRecord, EditRecord, RemoveRecords, UploadImageFromFile} from "./SystemFunctions.js";
import Popup from "../../classes/components/Popup.js";
import {Ajax, GetComboValue, ListenToDragAndDrop, ListenToForm, ManageComboBoxes, UUIDV4} from "../component/Tool.js";

const FILE_UPLOAD_DESTINATION = "public/assets/media/uploads/";

export function GetEmployee(id) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/GetEmployee",
            type: "POST",
            data: {id},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}

export function ChangeStatus(id, status) {
    return new Promise((resolve, reject) => {
        EditRecord("requests", {id, change_status: 1, data: JSON.stringify({status})}).then((res) => {
            try {
                resolve(JSON.parse(res));
            } catch (e) {
                reject(res.message);
            }
        });
    });
}

export function GetPackage(id) {
    return new Promise((resolve, reject) => {
        Ajax({
            url: "/api/post/GetPackage",
            type: "POST",
            data: {id},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    });
}

export function CompleteRequest(id, isWalkIN = false) {
    const popup = new Popup("requests/complete_requests", null, {
        backgroundDismiss: false,
    });

   return new Promise((resolve) => {
       popup.Create().then( (pop) => {
           popup.Show();

           const form = pop.ELEMENT.querySelector("form.form-control");
           const container = form.querySelector(".drag-and-drop-files-container");
           let files = [];

           ListenToDragAndDrop(container, function (upfiles) {
               files = upfiles;
           });

           ListenToForm(form, async function () {
               console.log(files)
                Promise.all(files.map(async (file) => {
                    return await UploadImageFromFile(file, UUIDV4(), FILE_UPLOAD_DESTINATION);
                })).then((filenames) => {
                    Ajax({
                        url: "/api/post/CompleteRequest",
                        type: "POST",
                        data: {id,isWalkIN, filenames: JSON.stringify(filenames.map(f => f.body.path))},
                        success: (res) => {
                            try {
                                resolve(JSON.parse(res));

                                popup.Remove();
                            } catch (e) {

                            }
                        }
                    })
                })

           })
       })
   })
}



/// ATTENDANCE

export function GetColumnsTable(tableHeader, tableBody) {
    return new Promise((resolve) => {
        Ajax({
            url: "/api/post/GetColumnsTable",
            type: "POST",
            data: {tableHeader, tableBody},
            success: (res) => {
                try {
                    resolve(JSON.parse(res));
                } catch (e) {
                    resolve(null);
                }
            }
        })
    })
}
