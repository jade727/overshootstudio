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
    RemoveRecords,
    SearchRecords,
    UpdateRecords, UploadImageFromFile
} from "../../../modules/app/SystemFunctions.js";
import {NewNotification, NotificationType} from "../../../classes/components/NotificationPopup.js";
import {GetPackage} from "../../../modules/app/Administrator.js";

const TARGET = "requests";
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
    const popup = new Popup("category/deleteRecord", null, {
        backgroundDismiss: false,
    });

    popup.Create().then((pop) => {
        popup.Show();

        const no = pop.ELEMENT.querySelector(".no-btn");
        const yes = pop.ELEMENT.querySelector(".yes-btn");

        no.addEventListener("click", () => {
            popup.Remove();
        });

        yes.addEventListener("click", () => {
            RemoveRecords(TARGET, ids.map((id) => {
                return {id: id}
            })).then(() => UpdateData().then(() => popup.Remove()))
        });
    })
}

function ViewRequest(id) {
    const popup = new Popup("client_manager/view_client", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");

        ListenToForm(form, function (data) {
            EditRecord(TARGET, {id, data: JSON.stringify(data)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Updated Clients' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();

                UpdateData();
            })
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

function AddRequest() {
    const popup = new Popup("requests/add_new_request", null, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");
        const packageCmbo = form.querySelector(".package_id");
        const price = form.querySelector('input[name=price]');
        let __PRICE;

        ListenToCombo(packageCmbo, function (value) {
            GetPackage(value).then((p) => {
                price.value = p.price;
                __PRICE = p.price;
            });
        })
        ListenToForm(form, function (data) {
            data.package_price = __PRICE;
            data.package_id = GetComboValue(packageCmbo).value;

            delete data.price;

            AcceptPayment(data).finally(() => popup.Remove());
        }, ["note"])

        ManageComboBoxes()
    }))
}


function ManageTable() {
    const TABLE = document.querySelector(".data-table-main-container");

    if (!TABLE) return;

    const TABLE_LISTENER = new TableListener(TABLE);

    TABLE_LISTENER.addListeners({
        none: {
            remove: ["delete-request", "view-request", "cancel-request"],
            view: ["add-request"],
        },
        select: {
            view: ["delete-request", "view-request", "cancel-request"],
        },
        selects: {
            view: ["delete-request", "cancel-request"],
            remove: ["view-request"]
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
                name: "view-request",
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