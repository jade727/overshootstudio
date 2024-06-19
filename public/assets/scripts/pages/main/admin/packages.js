import {
    addAttr,
    addHtml, append, CreateElement,
    HideShowComponent,
    ListenToForm,
    MakeID,
    ManageComboBoxes, UUIDV4
} from "../../../modules/component/Tool.js";
import Popup from "../../../classes/components/Popup.js";
import {TableListener} from "../../../classes/components/TableListener.js";
import {
    AddRecord, EditRecord,
    RemoveRecords, RemoveRecordsBatch,
    SearchRecords,
    UpdateRecords, UploadImageFromFile
} from "../../../modules/app/SystemFunctions.js";
import {NewNotification, NotificationType} from "../../../classes/components/NotificationPopup.js";
import AlertPopup, {AlertTypes} from "../../../classes/components/AlertPopup.js";

const TARGET = "packages";
const FILE_UPLOAD_DESTINATION = "public/assets/media/uploads/";

function UpdateTable(TABLE_HTML) {
    const TABLE_BODY = document.querySelector(".data-table-body");

    addHtml(TABLE_BODY, TABLE_HTML);
    ManageTable();
}

function UpdateData() {
    return UpdateRecords(TARGET).then((HTML) => UpdateTable(HTML));
}

function DeleteRequests(ids) {
    const popup = new AlertPopup({
        primary: "Delete Package?",
        secondary: `${ids.length} selected`,
        message: "Deleting these packages, cant be undone!"
    }, {
        alert_type: AlertTypes.YES_NO,
    });

    popup.AddListeners({
        onYes: () => {
            RemoveRecordsBatch(TARGET, {data: JSON.stringify(ids)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Deleted' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();
            }).finally(() => UpdateData());
        }
    })

    popup.Create().then(() => { popup.Show() })
}

function ViewRequest(id) {
    const popup = new Popup("packages/view_package", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const iimage = form.querySelector("input[type=file]");

        let uploaded = false;

        ListenToForm(form, async function (data) {

            if (uploaded) {
                const upload = await UploadImageFromFile(data.image, UUIDV4(), FILE_UPLOAD_DESTINATION);

                data.image = upload.body.path;
            } else {
                delete data['image'];
            }

            EditRecord(TARGET, {id, data: JSON.stringify(data)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Edited' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();

                UpdateData()
            });
        })

        iimage.addEventListener("change", function() {
            uploaded = true;
        })

        ManageComboBoxes()
    }))
}

function AddRequest() {
    const popup = new Popup("packages/add_new_package", null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");

        ListenToForm(form, async function (data) {

            const upload = await UploadImageFromFile(data.image, UUIDV4(), FILE_UPLOAD_DESTINATION);

            data.image = upload.body.path;

            AddRecord(TARGET, {data: JSON.stringify(data)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Added Clients' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();

                UpdateData()
            })
        })

        ManageComboBoxes()
    }))
}


function ManageTable() {
    const TABLE = document.querySelector(".data-table-main-container");

    if (!TABLE) return;

    const TABLE_LISTENER = new TableListener(TABLE);

    TABLE_LISTENER.addListeners({
        none: {
            remove: ["delete-request", "view-request", "edit-request"],
            view: ["add-request"],
        },
        select: {
            view: ["delete-request", "edit-request", "cancel-request"],
        },
        selects: {
            view: ["delete-request", "cancel-request"],
            remove: ["edit-request"]
        },
    });

    TABLE_LISTENER.init();

    TABLE_LISTENER.listen(() => {
        TABLE_LISTENER.addButtonListener([
            {
                name: "add-request",
                action: AddRequest,
                single: true
            },
            {
                name: "edit-request",
                action: ViewRequest,
                single: true
            },
            {
                name: "delete-request",
                action: DeleteRequests,
                single: false
            },
        ]);
    });
}


function Init() {
    ManageTable();
}

document.addEventListener("DOMContentLoaded", Init);