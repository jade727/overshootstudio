import AlertPopup, {AlertTypes} from "../../../classes/components/AlertPopup.js";
import {Ajax, MakeID, ToData} from "../../../modules/component/Tool.js";
import {NewNotification, NotificationType} from "../../../classes/components/NotificationPopup.js";


function DownloadSet(requestID) {
    return new Promise((resolve, reject) => {
        Ajax({
            url: "/api/post/DownloadSet",
            type: "POST",
            data: {requestID},
            success: (blob) => {
                console.log(blob)
                downloadImagesAsZIP(JSON.parse(blob))
            }
        })
    })
}

function downloadImagesAsZIP(images)
{
    var zip = new JSZip();

    images.forEach(({name, data}) => zip.file(name, data, {base64: true}));

    zip.generateAsync({type:"blob"})
        .then(function(content) {
            // see FileSaver.js
            saveAs(content,  MakeID(10) + ".zip");
        });
}


function ManageGallery() {
    const all = document.querySelectorAll(".gallery-item");

    for (const item of all) {
        const count = item.getAttribute("data-count");
        const id = item.getAttribute("data-id");


        item.addEventListener("click", function () {
            const popup = new AlertPopup({
                primary: "Download Set",
                secondary: `${count} images`,
                message: "Download this images as ZIP File"
            }, {
                alert_type: AlertTypes.YES_NO,
            });


            popup.AddListeners({
                onYes: () => {
                    DownloadSet(id).then(() => popup.Remove());
                }
            })

            popup.Create().then(() => popup.Show());
        })


    }
}
function Init() {
    ManageGallery();
}

document.addEventListener("DOMContentLoaded", Init);