import {ResetActiveComponent, SetActiveComponent} from "../../modules/component/Tool.js";

export class SidePicker {
        constructor(element) {
        this.element = element;
        this.elements = this.getElements();
    }

    getElements() {
        const parent = this.element;
        return {
            id: parent.getAttribute("data-id") ?? null,
            buttons:  [...parent.querySelectorAll(".side-bar-button")],
            containers: [...parent.querySelectorAll(".side-bar-content")]
        };
    }

    listens() {
        const obj = this;

        let first = null;

        for (const btn of this.GetButtons()) {
            const id = btn.getAttribute("data-id");

            if (first === null) {
                first = id;
            }

            btn.addEventListener("click", function () {
                obj.ShowContent(id);
            })
        }

        this.ShowContent(first)
    }

    ShowContent(id) {
        ResetActiveComponent(this.GetContainers());
        ResetActiveComponent(this.GetButtons());

        const content = this.GetContent(id);
        const button = this.GetButton(id);

        console.log(id)

        if (content !== null) {
            SetActiveComponent(content, true);
        }

        if (button !== null) {
            SetActiveComponent(button, true);
        }
    }

    GetContent(id) {
        for (const container of this.GetContainers()) {
            const content = container.getAttribute("data-content");

            if (content == id) {
                return container;
            }
        }

        return null;
    }

    GetButton(id) {
        for (const button of this.GetButtons()) {
            const __ID = button.getAttribute("data-id");


            if (__ID == id) {
                return button;
            }
        }

        return null;
    }

    GetContainers() {
        return this.elements.containers.filter((c) => {
            if (this.elements.id !== null) {
                if (c.getAttribute("data-picker") == this.elements.id) {
                    return c;
                }
            }
        });
    }

    GetButtons() {
        return this.elements.buttons.filter((c) => {
            if (this.elements.id !== null) {
                if (c.getAttribute("data-picker") == this.elements.id) {
                    return c;
                }
            }
        });
    }
}