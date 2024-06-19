import {
    Ajax,
    CreateElement,
    DisableScroll,
    EnableScroll,
    ExecuteFn, GetComboValue,
    HideShowComponent, ManageComboBoxes, SetNewComboItems,
    ToData
} from "../../modules/component/Tool.js";
import {CONTAINERS} from "../../modules/app/Application.js";
import {GetColumnsTable} from "../../modules/app/Administrator.js";

export  class FilterContainer {
    constructor(DATA = {}, OPTIONS = {}) {
        this.DATA = {...this.GetDefaultData(),...DATA};
        this.OPTIONS = this.InitOptions(OPTIONS);
        this.PARENT = this.FindMyParent();
        this.ELEMENT = null;
        this.LISTENERS = {};
        this.COLUMNS = [];
        this.COLUMNINFO = null;
    }

    async Load(header, body) {
        this.COLUMNS = await GetColumnsTable(header, body);
        this.COLUMNINFO = {header, body};

        console.log(this.COLUMNS)
        this.PlaceDatas();
    }

    GetDefaultData() {
        return {
            primary: 'This is my Popup',
            secondary: 'Supporting Details',
        }
    }


    AddListeners(listeners = {onYes: null, onNo: null, onCancel: null, onShow: null, onHide: null}) {
        this.LISTENERS = {
            ...listeners,
            ...this.LISTENERS
        }
    }

    InitOptions(option = {}) {
        return {
            ...option,
            backgroundDismiss: option.backgroundDismiss ?? false,
            removeOnDismiss: option.removeOnDismiss ?? false,
        };
    }

    FindMyParent() {
        const parentID = "big-pipes-container";
        const parent = document.querySelector("#" + parentID);

        const newParent = CreateElement({
            el: "section",
            id: parentID,
        });

        if (!parent) {
            CONTAINERS.popup.appendChild(newParent);
        }

        return parent ?? newParent;
    }

    Create() {
        const pop = this;

        return new Promise((resolve) => {

            Ajax({
                url: `/components/popup/system/createFilterPopup`,
                type: "POST",
                data: ToData({data: JSON.stringify(this.DATA), options: JSON.stringify(this.OPTIONS)}),
                success: (popup) => {
                    pop.Place(popup);
                    resolve(pop);
                },
            });
        });
    }


    Place(popup, node = false) {
        if (popup && this.PARENT) {
            this.ELEMENT = node
                ? this.CreateDefaultElement(popup)
                : CreateElement({
                    el: "SPAN",
                    html: popup,
                });

            this.PARENT.appendChild(this.ELEMENT);

            this.Listeners();

            this.Show();

            ExecuteFn(this.LISTENERS, "onPlace");
        }
    }

    Listeners() {
        if (this.PARENT && this.ELEMENT) {
            const main = this;
            const background = this.ELEMENT.querySelector(".popup-background");
            const closeBtn = this.ELEMENT.querySelector(".close-popup");

            const submit = this.ELEMENT.querySelector("input[type=submit]");

            const newFilterCol = this.ELEMENT.querySelector(".add-new-filter-column");

            background.addEventListener("click", () => {
                if (this.OPTIONS.backgroundDismiss) {
                    if (this.OPTIONS.removeOnDismiss) {
                        this.Remove();
                    } else {
                        this.Hide();
                    }
                }
            });

            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    this.Hide();
                });
            }
            
            if (submit) {
                submit.addEventListener("click", function (e) {
                    e.preventDefault();

                    main.SubmitFilter();
                });
            }

            newFilterCol.addEventListener("click", function () {
                main.CreateNewFilterColumn();
            })
        }
    }

    SubmitFilter() {
        const colChckbox = this.ELEMENT.querySelector("input[type=checkbox]");
        const fromDate = this.ELEMENT.querySelector("input[name=from_date]");
        const toDate = this.ELEMENT.querySelector("input[name=to_date]");
        const colDate = this.ELEMENT.querySelector("input[name=date_column]");

        const filterCol = this.ELEMENT.querySelector(".filter-column");

        const limit = this.ELEMENT.querySelector("input[name=limit]");
        const order = this.ELEMENT.querySelector("input[name=order]");

        const dateData = {
            fromDate: fromDate.value,
            toDate: toDate.value,
            column: colChckbox.checked ? colDate.value : 'default'
        }

        const columnData = [...filterCol.querySelectorAll(".three-input-container")].map((item) => {
            const combo = item.querySelector(".custom-combo-box");
            const operator = item.querySelector("input[name=operator]").value;
            const value = item.querySelector("input[name=value]").value;
            const column = GetComboValue(combo).value;

            return { column, value, operator };
        });

        const limitData = {
            limit: limit.value,
            order: order.value
        }

        const data = {dateData, columnData, limitData};

        console.log(data)
        return new Promise((resolve,reject) => {
            Ajax({
                url: `/components/popup/system/filterTable`,
                type: "POST",
                data: {data: JSON.stringify(data), options: JSON.stringify(this.OPTIONS), tableData: JSON.stringify(this.COLUMNINFO)},
                success: (data) => {
                    ExecuteFn(this.LISTENERS, "onFilter", data);
                    resolve(data);
                },
            });
        })
    }

    async CreateNewFilterColumn() {
        const parent = this.ELEMENT.querySelector(".filter-column .main-content");

        return new Promise((resolve) => {
            Ajax({
                url: `/components/popup/system/createNewFilterColumn`,
                type: "POST",
                success: (data) => {
                    resolve(data);
                },
            });
        }).then((res) => {
            const fragment = document.createDocumentFragment();
            const span = CreateElement({
                el: "SPAN",
                html: res
            })

            fragment.appendChild(span);

            parent.append(fragment);

            this.PlaceDatas();
        })

    }

    Show() {
        if (!this.ELEMENT) return false;

        DisableScroll();
        HideShowComponent(this.ELEMENT, true);
        ExecuteFn(this.LISTENERS, "onShow");

        return this.ELEMENT;
    }

    Hide() {
        if (!this.ELEMENT) return false;

        EnableScroll();
        HideShowComponent(this.ELEMENT, false);
        ExecuteFn(this.LISTENERS, "onHide");
    }

    Remove() {
        if (!this.ELEMENT) return false;

        EnableScroll()

        this.ELEMENT.remove();

        ExecuteFn(this.LISTENERS, "onRemove");
    }

    PlaceDatas() {
        // place filter by columns
        const threeInput = this.ELEMENT.querySelectorAll(".filter-column .three-input-container");

        // FILTER DATES
        const filterDates = this.ELEMENT.querySelector(".filter-dates");

        const colChckbox = filterDates.querySelector("input[type=checkbox]");
        const colItem = filterDates.querySelector(".col-item");

        colChckbox.addEventListener("change", function () {
           HideShowComponent(colItem, colChckbox.checked, false);
        })


        for (const TI of threeInput) {
            const combo = TI.querySelector(".custom-combo-box");
            const operator = TI.querySelector("input[name=operator]");
            const value = TI.querySelector("input[name=value]");
            const closeBtn = TI.querySelector(".close-btn-item");

            SetNewComboItems(combo, {text: this.COLUMNS.header, value: this.COLUMNS.body});
            
            operator.addEventListener("change", function () {
                const validOperators = ["==", "===", "<=", ">=", ">", "<"];
                const isValid = validOperators.includes(operator.value.trim());

                if (!isValid) {
                    operator.value = "==";
                }
            });

            closeBtn.addEventListener("click", function () {
                TI.remove()
            })

        }

        ManageComboBoxes();

    }
}

export default FilterContainer;