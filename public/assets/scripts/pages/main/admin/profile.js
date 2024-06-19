import {SidePicker} from "../../../classes/components/SidePicker.js";
import Popup from "../../../classes/components/Popup.js";
import {GetComboValue, ListenToForm, ManageComboBoxes} from "../../../modules/component/Tool.js";
import {EditRecord, RemoveRecordsBatch} from "../../../modules/app/SystemFunctions.js";
import {NewNotification, NotificationType} from "../../../classes/components/NotificationPopup.js";
import {TableListener} from "../../../classes/components/TableListener.js";
import AlertPopup, {AlertTypes} from "../../../classes/components/AlertPopup.js";


function ViewRequest(id) {
    const popup = new Popup("users/edit_account", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const form = pop.ELEMENT.querySelector("form.form-control");

        ListenToForm(form, function (data) {
            data['gender'] = data['gender'] == 'Male' ? 0 : 1;

            delete data['image'];

            EditRecord("users", {id, data: JSON.stringify(data)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Successfully Updated' : 'Failed to Update',
                    message: res.message,
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();

                location.replace('/portal/logout');
            })
        }, ['image'])

        ManageComboBoxes()
    }))
}

function RestoreRequest(type, primary, ids) {
    const popup = new AlertPopup({
        primary: "Do you really want to restore these items?",
        secondary: `${ids.length} selected`,
        message: "These will return to it's original table"
    }, {
        alert_type: AlertTypes.YES_NO,
    });

    popup.AddListeners({
        onYes: () => {
            EditRecord("dbstatus", {type, primary, ids: JSON.stringify(ids)}).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.code === 200 ? 'Successfully Restore' : 'Task Failed to perform!'
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                popup.Remove();
            }).then(() => location.reload());
        }
    })

    popup.Create().then(() => { popup.Show() })
}

function ShowRecycleBin(type) {
    const popup = new Popup("recycler_bin/view_recycler_bin", {type: type}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const TABLE = pop.ELEMENT.querySelector(".data-table-main-container");

        if (!TABLE) return;

        const table_primary = TABLE.getAttribute("data-id");

        const TABLE_LISTENER = new TableListener(TABLE);

        TABLE_LISTENER.addListeners({
            none: {
                remove: ["restore-request"],
                view: [],
            },
            select: {
                view: ["restore-request"],
            },
            selects: {
                view: ["restore-request"],
                remove: []
            },
        });

        TABLE_LISTENER.init();

        TABLE_LISTENER.listen(() => {
            TABLE_LISTENER.addButtonListener([
                {
                    name: "restore-request",
                    action: (ids) => {
                        RestoreRequest(type, table_primary, ids);
                    },
                    single: false
                },
            ]);
        });

        ManageComboBoxes()
    }))
}
function ManageButtons() {
    const editBtn = document.querySelector(".edit-profile-btn");
    const __ID = editBtn.getAttribute("data-id");

    const recycler_bin_form = document.querySelector(".recycler_bin_form");
    const change_password_form = document.querySelector(".change_password_form");
    const table_type = recycler_bin_form.querySelector(".table_type");

    editBtn.addEventListener("click", function () {
        ViewRequest(__ID);
    })
    
    ListenToForm(recycler_bin_form, function () {
        const type = GetComboValue(table_type).value;

        ShowRecycleBin(type);
    })
    
    ListenToForm(change_password_form, function (data) {
        EditRecord("user_password", {data: JSON.stringify(data)}).then((res) => {
            NewNotification({
                title: res.code === 200 ? 'Success' : 'Failed',
                message:res.message
            }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)
            if (res.code != 200) {
                [...change_password_form.querySelectorAll('input')].forEach((i) => {
                    if (i.type != 'submit') {
                        i.value = "";
                    }
                });
            }else {
                setTimeout( () => { location.reload()}, 2000);
            }
        });


    })
}
function Init() {
    const sideBar = document.querySelector(".profile-sidebar");
    const sideBarSecurity = document.querySelector(".security-sidebar");

    const SIDEBARCON = new SidePicker(sideBar);
    const SIDEBARSEC = new SidePicker(sideBarSecurity);

    SIDEBARCON.listens();
    SIDEBARSEC.listens();

    ManageButtons();
    ManageComboBoxes();
}

Init();