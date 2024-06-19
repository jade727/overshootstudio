import {ChangeStatus, CompleteRequest} from "../../../modules/app/Administrator.js";
import AlertPopup, {AlertTypes} from "../../../classes/components/AlertPopup.js";
import {NewNotification, NotificationType} from "../../../classes/components/NotificationPopup.js";
import Popup from "../../../classes/components/Popup.js";
import {
    HideShowComponent,
    ListenToCombo,
    ListenToForm,
    ManageComboBoxes,
    UUIDV4
} from "../../../modules/component/Tool.js";
import {AddRecord, EditRecord, UploadImageFromFile} from "../../../modules/app/SystemFunctions.js";

function CompletePayment(id, isWalkIN) {
    const popup = new Popup("requests/new_payment", {id: id, isWalkIN}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();
        
        const method = pop.ELEMENT.querySelector('.method');
        const forGcash = pop.ELEMENT.querySelector('.for-gcash');
        const forCash = pop.ELEMENT.querySelector('.for-cash');
        const form = pop.ELEMENT.querySelector('form.form-control');
        const balance = pop.ELEMENT.querySelector('input[name=balance]');
        const change = pop.ELEMENT.querySelector('input[name=cash_change]');
        const cash = pop.ELEMENT.querySelector('input[name=cash]');

        if (balance.value <= 0) {
            popup.Remove();
            CompleteRequest(id, isWalkIN).then((res) => {
                NewNotification({
                    title: res.code === 200 ? 'Success' : 'Failed',
                    message: res.message
                }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)
            })
        } else {
            ListenToCombo(method, function (value) {
                HideShowComponent(forGcash, value == 2, false);
                HideShowComponent(forCash, value == 1, false);

                if (value == 1) {
                    // cash
                    ListenToForm(form, function (data) {
                        data['method'] = value;
                        data['balance'] = balance.value;
                        data['is_walkin'] = isWalkIN ? 1 : 0;

                        AddRecord("other_payments", {id, data: JSON.stringify(data)}).then((res) => {

                            console.log(data)
                            NewNotification({
                                title: res.code === 200 ? 'Success' : 'Failed',
                                message: res.message
                            }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                            popup.Remove();

                            resolve();
                        })
                    }, ["number", "sender_number", "sent_amount", "reference", "note"])
                } else {
                    ListenToForm(form, function (data) {
                        data['method'] = value;
                        data['balance'] = balance.value;
                        data['is_walkin'] = isWalkIN ? 1 : 0;

                        console.log(data)

                        AddRecord("other_payments", {id, data: JSON.stringify(data)}).then((res) => {
                            NewNotification({
                                title: res.code === 200 ? 'Success' : 'Failed',
                                message: res.message
                            }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)

                            popup.Remove();

                            resolve();
                        })
                    }, ['cash', 'cash_change', 'note'])
                }
            })

            cash.addEventListener("input", function () {
                change.value =  cash.value - balance.value;
            })
        }

        ManageComboBoxes()
    }))
}
function ViewPayment(packageID, id) {
    const popup = new Popup("requests/view_payment", {id: id, packageID}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();


        ManageComboBoxes()
    }))
}
function ShowRequest(id) {
    const popup = new Popup("requests/view_request", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();
        
        const viewpayment = pop.ELEMENT.querySelector(".view-payment");
        
        viewpayment.addEventListener("click", function () {
            ViewPayment(id, viewpayment.getAttribute("data-id"));
        })
        
        ManageComboBoxes()
    }));
}

function ShowWalkIN(id) {
    const popup = new Popup("requests/view_walkin", {id: id}, {
        backgroundDismiss: false,
    });

    popup.Create().then(((pop) => {
        popup.Show();

        const viewpayment = pop.ELEMENT.querySelector(".view-payment");

        viewpayment.addEventListener("click", function () {
            ViewPayment(id, viewpayment.getAttribute("data-id"));
        })

        ManageComboBoxes()
    }));
}

function ManageCards() {
    const pendingCards = document.querySelectorAll(".data-table-main-container.pending-requests .request-card");
    const acceptedCards = document.querySelectorAll(".data-table-main-container.accepted-requests .request-card");
    const walkInAcceptedCards = document.querySelectorAll(".data-table-main-container.accepted-requests-walkin .request-card");

    for (const card of pendingCards) {
        const headline = card.querySelector(".headline");
        const declineBtn = card.querySelector(".decline-button");
        const acceptBtn = card.querySelector(".accept-button");
        const id = card.getAttribute("data-id");

        headline.addEventListener("click", function () {
            ShowRequest(id);
        })

        acceptBtn.addEventListener("click", function () {
            const popup = new AlertPopup({
                primary: "Are you sure?",
                secondary: `Accept request`,
                message: "This request will be moved to approved table."
            }, {
                alert_type: AlertTypes.YES_NO,
            });

            popup.AddListeners({
                onYes: () => {
                    ChangeStatus(id, 2).then((res) => {
                        NewNotification({
                            title: res.code === 200 ? 'Success' : 'Failed',
                            message: res.message,
                            callback: () => location.reload()
                        }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR);
                    });
                }
            })

            popup.Create().then(() => { popup.Show() })
        });

        declineBtn.addEventListener("click", function () {
            const popup = new AlertPopup({
                primary: "Are you sure?",
                secondary: `Decline request`,
                message: "This request will be moved to declined table."
            }, {
                alert_type: AlertTypes.YES_NO,
            });

            popup.AddListeners({
                onYes: () => {
                    ChangeStatus(id, 3).then((res) => {
                        NewNotification({
                            title: res.code === 200 ? 'Success' : 'Failed',
                            message: res.message,
                            callback: () => location.reload()
                        }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR);
                    });
                }
            })

            popup.Create().then(() => { popup.Show() })
        });
    }

    for (const card of acceptedCards) {
        const headline = card.querySelector(".headline");
        const cancelBtn = card.querySelector(".cancel-button");
        const completeBtn = card.querySelector(".complete-button");
        const id = card.getAttribute("data-id");

        headline.addEventListener("click", function () {
            ShowRequest(id);
        })

        completeBtn.addEventListener("click", function () {
            CompletePayment(id, false);


        })
    }

    for (const card of walkInAcceptedCards) {
        const headline = card.querySelector(".headline");
        const cancelBtn = card.querySelector(".cancel-button");
        const completeBtn = card.querySelector(".complete-button");
        const id = card.getAttribute("data-id");

        headline.addEventListener("click", function () {
            ShowWalkIN(id);
        })

        completeBtn.addEventListener("click", function () {
            CompletePayment(id, true);
            // CompleteRequest(id, true).then((res) => {
            //     NewNotification({
            //         title: res.code === 200 ? 'Success' : 'Failed',
            //         message: res.message
            //     }, 3000, res.code === 200 ? NotificationType.SUCCESS : NotificationType.ERROR)
            // })
        })
    }
}

function Init() {

    ManageCards();

}

document.addEventListener("DOMContentLoaded", Init);