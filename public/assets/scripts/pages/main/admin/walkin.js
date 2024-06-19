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
import {GetPackage} from "../../../modules/app/Administrator.js";

const TARGET = "walkin";
const FILE_UPLOAD_DESTINATION = "public/assets/media/uploads/";

function UpdateTable(TABLE_HTML) {
    const TABLE_BODY = document.querySelector(".main-table-body");

    addHtml(TABLE_BODY, TABLE_HTML);
    ManageTable();
}

function UpdateData() {
    return UpdateRecords(TARGET).then((HTML) => UpdateTable(HTML));
}

function DeleteRequests(ids) {
    const popup = new AlertPopup({
        primary: "Delete Walk In records?",
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
    const popup = new Popup("walkin_requests/view_walkin", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const packageCmbo = form.querySelector(".package_id");
        const pric = form.querySelector('input[name=price]');
        const price = form.querySelector('input[name=price]');
        let __PRICE;
        ListenToForm(form, function (data) {
            data.package_id = GetComboValue(packageCmbo).value;
            data.package_price = __PRICE;
            data.balance  = data.package_price - data.down_payment;

            EditRecord(TARGET, {id, data: JSON.stringify(data)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Updated Clients' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();

                UpdateData();
            })
        }, ["note"]);


        ListenToCombo(packageCmbo, function (value, key) {
            GetPackage(value).then((p) => {
                price.value = p.price;
                __PRICE = p.price;
            });
        })

        ManageComboBoxes()
    }))
}

function AcceptPayment(requestData) {
    const popup = new Popup("requests/accept_payment", {requestData}, {
        backgroundDismiss: false,
    });


    return new Promise((resolve, reject) => {
        popup.Create().then((pop) => {
            popup.Show();

            const form = pop.ELEMENT.querySelector("form.form-control");
            const number = form.querySelector("input[name=number]");
            const topay = form.querySelector("input[name=topay]");

            ListenToForm(form, async function (data) {
                data.number = number.value;
                data.topay = topay.value;


                const upload = await UploadImageFromFile(data.image, UUIDV4(), FILE_UPLOAD_DESTINATION);

                data.image = upload.body.path;

                AddRecord(TARGET, {data: JSON.stringify(requestData), paymentData: JSON.stringify(data)}).then((res) => {
                    NewNotification({
                        title: res.code === 200 ? 'Success' : 'Failed',
                        message: res.message
                    }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                    popup.Remove();

                    UpdateData();

                    resolve();
                })
            }, ["note"])

        });
    });
}

function ViewAccountLogin(id) {
    const popup = new Popup("users/view_login_account", {user_id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then((res) => {
        popup.Show();

    })
}

function AddRequest() {
    const popup = new Popup("walkin_requests/add_new_request", null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const packageCmbo = form.querySelector(".package_id");
        const pric = form.querySelector('input[name=price]');
        const price = form.querySelector('input[name=price]');

        ListenToForm(form, function (data) {
            data.package_id = GetComboValue(packageCmbo).value;
            data.package_price = price.value;
            data.balance  = data.package_price - data.down_payment;

            AddRecord(TARGET, {data: JSON.stringify(data)}).then(r => {
                if (r.code == 200) {
                    ViewAccountLogin(r.body['user_id']);

                    popup.Remove()
                }
            });
        }, ["note"]);
        
        ListenToCombo(packageCmbo, function (value, key) {
            GetPackage(value).then((p) => pric.value = p.price);
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