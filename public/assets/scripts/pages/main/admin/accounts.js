import {
    addHtml,
    ListenToForm,
    ManageComboBoxes,
} from "../../../modules/component/Tool.js";
import Popup from "../../../classes/components/Popup.js";
import {TableListener} from "../../../classes/components/TableListener.js";
import {
    AddRecord, EditRecord,
     RemoveRecordsBatch,
    UpdateRecords
} from "../../../modules/app/SystemFunctions.js";
import {NewNotification, NotificationType} from "../../../classes/components/NotificationPopup.js";
import AlertPopup from "../../../classes/components/AlertPopup.js";
import {AlertTypes} from "../../../classes/components/AlertPopup.js";

const TARGET = "users";
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
        primary: "Delete Account?",
        secondary: `${ids.length} selected`,
        message: "Deleting these accounts, cant be undone!"
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
    const popup = new Popup("users/edit_account", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");

        let changedImage = false;

        ListenToForm(form, function (data) {
            data['gender'] = data['gender'] == 'Male' ? 0 : 1;

            delete data['image'];

            EditRecord(TARGET, {id, data: JSON.stringify(data)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.message,
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();
            })
        }, ['image'])

        ManageComboBoxes()
    }))
}



function AddRequest() {
    const popup = new Popup("users/add_new_account", null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");

        ListenToForm(form, function (data) {
            data['gender'] = data['gender'] == 'Male' ? 0 : 1;
            delete data['image'];
            AddRecord(TARGET, {data: JSON.stringify(data)}).then(res => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.message,
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();
            });
        }, ["image"]);

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
            view: ["delete-request", "view-request", "edit-request"],
        },
        selects: {
            view: ["delete-request", "cancel-request"],
            remove: ["view-request", "edit-request"]
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