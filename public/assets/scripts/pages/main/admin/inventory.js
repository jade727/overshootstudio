import {
    addAttr,
    addHtml, append, CreateElement, GetComboValue,
    HideShowComponent, ListenToCombo,
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

const TARGET = "inventory";
const FILE_UPLOAD_DESTINATION = "public/assets/media/uploads/";

function UpdateTable(TABLE_HTML) {
    const TABLE_BODY = document.querySelector(".data-table-body");

    addHtml(TABLE_BODY, TABLE_HTML);
    ManageTable();
}

function UpdateData() {
    return UpdateRecords(TARGET).then((HTML) => UpdateTable(HTML));
}

function NewInventoryRequest() {
    const popup = new Popup("inventory/new_inventory", null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");

        ListenToForm(form, function (data) {
            AddRecord("inventory_report", {data: JSON.stringify(data)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Inventory Created' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();
            })
        })

        ManageComboBoxes()
    }))
}

function DeleteRequests(ids) {
    const popup = new AlertPopup({
        primary: "Delete Inventory Item?",
        secondary: `${ids.length} selected`,
        message: "Deleting these records, cant be undone!"
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
    const popup = new Popup("inventory/view_item", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const itemStatus = form.querySelector(".item_status");
        const additional = form.querySelector(".status-additional");

        ListenToForm(form, function (data) {
            delete data['image'];

            data['item_status'] = GetComboValue(itemStatus).value;

            EditRecord(TARGET, {id, data: JSON.stringify(data)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Updated' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();

                UpdateData();
            })
        }, ["description", "color", "size", "image","quantity_involved", "person_involved", "date_involved", "status_description"])


        ListenToCombo(itemStatus, function (value, key) {
            HideShowComponent(additional, value != 1);
        })

        ManageComboBoxes()
    }))
}



function AddRequest() {
    const popup = new Popup("inventory/add_new_item", null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const packageCmbo = form.querySelector(".package_id");
        const itemStatus = form.querySelector(".item_status");
        const additional = form.querySelector(".status-additional");

        ListenToForm(form, function (data) {
            delete data['image'];
            data['item_status'] = GetComboValue(itemStatus).value;

            AddRecord(TARGET, {data: JSON.stringify(data)}).then(res => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Deleted' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();

            }).finally(() => UpdateData());
        }, ["description", "color", "size", "image","quantity_involved", "person_involved", "date_involved", "status_description"]);

        ListenToCombo(packageCmbo, function (value, key) {
            console.log(value, key)
        })

        ListenToCombo(itemStatus, function (value, key) {
            HideShowComponent(additional, value != 1);
        })

        ManageComboBoxes()
    }))
}


function ViewInventory(id) {
    const popup = new Popup("inventory/view_inventory", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();


        ManageComboBoxes()
    }))
}
function ManageTable() {
    const TABLE = document.querySelector(".data-table-main-container.main");

    if (!TABLE) return;

    const TABLE_LISTENER = new TableListener(TABLE);

    TABLE_LISTENER.addListeners({
        none: {
            remove: ["delete-request", "view-request", "edit-request"],
            view: ["add-request", "new-request"],
        },
        select: {
            view: ["delete-request", "view-request", "edit-request"],
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
            {
                name: "new-request",
                action: NewInventoryRequest,
                single: false
            },
        ]);
    });
}

function ManageInventoryTable() {
    const TABLE = document.querySelector(".data-table-main-container.inventory-records");

    if (!TABLE) return;

    const TABLE_LISTENER = new TableListener(TABLE);

    TABLE_LISTENER.addListeners({
        none: {
            remove: [ "view-request"],
            view: ["add-request", "new-request"],
        },
        select: {
            view: [ "view-request"],
        },
        selects: {
            view: [],
            remove: ["view-request"]
        },
    });

    TABLE_LISTENER.init();

    TABLE_LISTENER.listen(() => {
        TABLE_LISTENER.addButtonListener([
            {
                name: "view-request",
                action: ViewInventory,
                single: true
            },
        ]);
    });
}

function Init() {
    ManageTable();
    ManageInventoryTable();
}

document.addEventListener("DOMContentLoaded", Init);