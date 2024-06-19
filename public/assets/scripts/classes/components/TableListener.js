import {
    append, ChunkArray, CreateCheckBox,
    CreateElement,
    HideShowComponent,
    RemoveAllListenerOf, removeClass, ResetActiveComponent, SetActiveComponent,
    ToggleComponentClass
} from "../../modules/component/Tool.js";

export class TableListener {
    constructor(parent) {
        this.parent = parent;
        this.elements = this.initElements(parent);
        this.listeners = {};
        this.conditions = [];
        this.buttons = [];
        this.selected = [];
        this.singularSelection = false;
        this.enableSelection = true;
        this.pagination = {
            max: 10,
            current: 1,
            items: [],
            searchContent: [],
            searchItems: [],
            footer: null
        }

        this.activatePagination();
    }

    initElements(parent) {

        return {
            header: parent.querySelector(".grid-table-header"),
            body: parent.querySelector(".grid-table-body"),
            checkbox: parent.querySelector(
                ".grid-table-header .custom-checkbox-parent input"
            ),
            items: [...parent.querySelectorAll(".grid-table-body .body-item")],
        };
    }

    addListeners(listeners = {}) {
        this.listeners = listeners;
    }

    addButtons(buttons = []) {
        this.buttons = buttons;
    }

    buttonExist(name) {
        for (const button of this.buttons) {
            if (button.name === name) {
                return button;
            }
        }

        return false;
    }

    search(toSearch) {
        const searchContent = [];

        for (const tr of this.pagination.items) {
            const tds = tr.querySelectorAll("td");

            const searchForMatch = [...tds].filter((td) => new RegExp("\\b"+ toSearch +"\\b").test(td.innerText));

            if (searchForMatch.length) {
                searchContent.push(tr);
            }
        }

        this.pagination.searchContent = searchContent;
        this.pagination.current = 1;
        this.reactivatePagination();
    }
    init() {
        for (const obj of Object.values(this.listeners)) {
            for (const value of Object.values(obj)) {
                if (Array.isArray(value)) {
                    for (const val of value) {
                        if (!Array.isArray(val)) {
                            if (!this.buttonExist(val)) {
                                const button = this.parent.querySelector(
                                    `.table-button[data-name=${val}]`
                                );

                                if (button) {
                                    this.buttons.push({
                                        name: val,
                                        element: RemoveAllListenerOf(button),
                                    });
                                }
                            }
                        } else {
                            if (!this.buttonExist(val[0])) {
                                const button = this.parent.querySelector(
                                    `.table-button[data-name=${val[0]}]`
                                );

                                this.conditions.push(val);
                                this.buttons.push({
                                    name: val[0],
                                    element: RemoveAllListenerOf(button),
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    resetAllListenerItems() {
        for (const item of this.elements.items) {
            RemoveAllListenerOf(item);
        }
    }

    insertItem(id, values) {
        const tableBody = this.elements.body;
        const element = CreateElement({
            el: "TR",
            className: "body-item",
            attr: {
                "data-id": id
            },
            childs: [CreateElement({
                el: "TD",
                child: CreateCheckBox()
            }),...values.map((text) => CreateElement({
                el: "TD",
                text: text
            }))]
        });

        append(tableBody, element);

        this.addListenerToItem(element);

        this.elements = this.initElements(this.parent);
    }

    listen(callback) {
        const checkbox = this.elements.checkbox;

        // this.resetAllListenerItems();

        if (this.selected.length === 0) {
            this.executeListener("none");
        }

        for (const item of this.elements.items) {
            this.addListenerToItem(item);
        }

        if (checkbox) {
            checkbox.addEventListener("click", () => {
                if (checkbox.checked) {
                    this.selectAll();
                } else {
                    this.unselectAll();
                }
            });
        }

        callback && callback();
    }

    addListenerToItem(item) {
        item.addEventListener("click", (evt) => {
            const id = item.getAttribute("data-id");
            this.selectItem(id, evt.shiftKey, evt.ctrlKey);
        });
    }

    selectAll() {
        for (const item of this.elements.items) {
            const id = item.getAttribute("data-id");

            if (!this.selected.includes(id)) {
                this.selectItem(id);
            }
        }
    }

    unselectAll() {
        for (const item of this.elements.items) {
            const id = item.getAttribute("data-id");

            if (this.selected.includes(id)) {
                this.selectItem(id);
            }
        }
    }

    executeListener(name, ...values) {
        if (this.listeners[name]) {
            const listener = this.listeners[name];

            if (listener.view && listener.view.length) {
                for (const btn of listener.view) {
                    if (Array.isArray(btn)) {
                        if (this.compareValue(this.selected, btn[1][0], btn[1][1])) {
                            this.viewButton(btn[0])
                        } else {
                            this.removeButton(btn[0]);
                        }
                    } else {
                        this.viewButton(btn);
                    }
                }
            }

            if (listener.remove && listener.remove.length) {
                for (const btn of listener.remove) {
                    this.removeButton(btn);
                }
            }
        }
    }

    resetButtons() {
        for (const btn of this.buttons) {
            this.removeButton(btn.name);
        }
    }

    viewButton(name) {
        for (const button of this.buttons) {
            if (button.name === name) {
                HideShowComponent(button.element, true);
            }
        }
    }

    removeButton(name) {
        for (const button of this.buttons) {
            if (button.name === name) {
                HideShowComponent(button.element, false);
            }
        }
    }

    selectItem(id, PRESS_SHIFT, PRESS_CTRL) {
        if (this.enableSelection) {
            for (const item of this.elements.items) {
                if (item.getAttribute("data-id") === id) {
                    const selected = this.selected.includes(id);
                    const checkbox = item.querySelector("input");

                    ToggleComponentClass(item, "selected", !selected);

                    checkbox.checked = !selected;

                    if (PRESS_SHIFT) {
                        if (this.selected.length) {
                            console.log(this.selected, item)
                        }
                    } else if (PRESS_CTRL) {

                    } else {
                        if (selected) {
                            this.selected = this.selected.filter((i) => i !== id);
                        } else {
                            this.selected.push(id);
                        }
                    }

                    this.update();
                } else if (this.singularSelection) {
                    const checkbox = item.querySelector("input");

                    ToggleComponentClass(item, "selected", false);

                    if (checkbox) {
                        checkbox.checked = false;
                    }

                    this.selected = this.selected.filter((i) => i !== item.getAttribute("data-id"));

                    this.update();
                }
            }
        }
    }

    update() {
        if (this.selected.length === 0) {
            this.executeListener("none");
        } else if (this.selected.length === 1) {
            this.executeListener("select", this.selected[0]);
        } else {
            this.executeListener("selects", this.selected);
        }

        this.elements.checkbox.checked =
            this.selected.length === this.elements.items.length;
    }

    updateContent() {
        this.elements = this.initElements(this.parent);
        this.listen();
    }

    addButtonListener(listeners) {
        for (const listener of listeners) {
            const button = this.buttonExist(listener.name);

            if (button) {
                button.element.addEventListener("click", () => {
                    if (listener.action) {
                        listener.action(listener.single ? this.selected[0] : this.selected);
                    }
                });
            }
        }
    }

    compareValue(selected, colTarget, colCompare) {
        for (const sel of selected) {
            const rowID = this.getRowIDOfValue(sel);
            const targetValue =  this.getValue(rowID, colTarget);
            const texts = colCompare.split("|");

            if (texts.includes(targetValue)) {
                return true;
            }
        }

        return false;
    }

    getValue(row, column) {
        const rows = this.elements.items;

        if (rows.length) {
            if (rows[row]) {
                const columns = rows[row].querySelectorAll("td");
                return columns[column].textContent;
            }
        }

        return null;
    }

    getRowIDOfValue(sel) {
        let index = 0;
        for (const item of this.elements.items) {
            if (item.getAttribute("data-id") === sel) {
                return index;
            }
            index++;
        }

        return -1;
    }

    removeItem(id) {
        for (const item of this.elements.items) {
            if (item.getAttribute("data-id") === id) {
                item.remove();
            }
        }
    }

    updateItem(id, values) {
        for (const item of this.elements.items) {
            if (item.getAttribute("data-id") === id) {
                const tds = item.querySelectorAll("td");

                for (let i = 1; i < tds.length; i++) {
                    tds[i].innerText = values[i - 1];
                }
            }
        }
    }

    disableSelections() {
        this.enableSelection = false
    }

    createFooter() {
        const obj = this;

        const getPaginationChilds = () => {
            const buttons = this.pagination.items.slice(this.pagination.current - 1, this.pagination.max + 1);

            return buttons.map((b, i) => {
                return CreateElement({
                    el:"DIV",
                    className: "item",
                    child: CreateElement({
                        el:"SPAN",
                        text: i + 1
                    }),
                    listener: {
                        click: () => {
                            obj.viewPage(i + 1);
                        }
                    }
                })
            });
        }

        return CreateElement({
            el: "div",
            className: "main-table-footer",
            childs: [
                CreateElement({
                    el:"DIV",
                    className: "footer-left",
                    child: CreateElement({
                        el: "DIV",
                        className: ["text", "changing-text"],
                        child: CreateElement({
                            el:"SPAN",
                            text: "0 / 0"
                        })
                    })
                }),
                CreateElement({
                    el:"DIV",
                    className: "footer-right",
                    child: CreateElement({
                        el: "DIV",
                        className: "pagination-buttons",
                        child: [
                            CreateElement({
                                el:"DIV",
                                className: ["pagination-button", "prev-button", "icon-button"],
                                childs: [
                                    CreateElement({
                                        el:"DIV",
                                        className: "icon",
                                        html: `<svg width="256px" height="256px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M160,212a3.98805,3.98805,0,0,1-2.82861-1.17163l-80-80a4,4,0,0,1,0-5.65674l80-80a4.00009,4.00009,0,0,1,5.65722,5.65674L85.65674,128l77.17187,77.17163A4,4,0,0,1,160,212Z"/>
                                                </svg>`
                                    })
                                ],
                                listener: {
                                    click: () => {
                                        this.viewPage(this.pagination.current - 1);
                                    }
                                }
                            }),
                            CreateElement({
                                el:"SPAN",
                                className: "items",
                                childs: getPaginationChilds()
                            }),
                            CreateElement({
                                el:"DIV",
                                className: ["pagination-button", "next-button", "icon-button"],
                                childs: [
                                    CreateElement({
                                        el:"DIV",
                                        className: "icon",
                                        html: `<svg width="256px" height="256px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M96,212a4,4,0,0,1-2.82861-6.82837L170.34326,128,93.17139,50.82837a4.00009,4.00009,0,0,1,5.65722-5.65674l80,80a4,4,0,0,1,0,5.65674l-80,80A3.98805,3.98805,0,0,1,96,212Z"/>
                                                </svg>`
                                    }),
                                ],
                                listener: {
                                    click: () => {
                                        this.viewPage(this.pagination.current + 1);
                                    }
                                }
                            }),
                        ]
                    })
                }),
            ]
        });
    }

    activatePagination() {
        this.pagination.items = ChunkArray(this.elements.items, this.pagination.max);

        const oldFooter = this.parent.querySelector(".main-table-footer");

        if (oldFooter) {
            oldFooter.remove();
        }

        this.pagination.footer = this.createFooter();

        this.parent.appendChild(this.pagination.footer);

        this.pagination.changingText = this.pagination.footer.querySelector(".changing-text span");

        this.viewPage(this.pagination.current);
    }

    viewPage(number) {
        if (this.pagination.items.length) {
            if (number > this.pagination.items.length || number == 0) return

            if (number <= this.pagination.items.length || number > 0) {
                const items = this.pagination.items[number - 1];

                for (let i = 0; i < this.pagination.items.length; i++) {
                    if (i !== (number - 1)) {
                        for (let j = 0; j < this.pagination.items[i].length; j++) {
                            HideShowComponent(this.pagination.items[i][j], false, false);
                        }
                    }
                }

                for (const item of items) {
                    removeClass(item, "hide-component");
                }

                this.pagination.current = number;
                this.pagination.viewed = this.pagination.items.slice(0, number).map(a => a.length).reduce((a,b) => a +b);
                this.pagination.outof = this.elements.items.length;

                this.pagination.changingText.innerText = `${this.pagination.viewed} / ${this.pagination.outof}`;
                this.changePaginationActive();
            }
        }
    }

    changePaginationActive() {
        const footer = this.pagination.footer;
        const items = footer.querySelectorAll('.pagination-buttons .items .item');

        ResetActiveComponent(items);

        SetActiveComponent([...items].filter((i) => parseInt( i.innerText.trim()) === this.pagination.current)[0], true)
    }

    reactivatePagination() {
        this.pagination.searchItems = ChunkArray(this.pagination.searchContent, this.pagination.max);

        this.viewPage(this.pagination.current);
    }
}