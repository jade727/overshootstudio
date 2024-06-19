<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\models\Inventory;

class InventoryControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Inventory::class;
    protected $TABLE_NAME = "inventory";
    protected $TABLE_PRIMARY_ID = "inventory_id";
    protected $SEARCH_LOOKUP = [];

    public function add($data)
    {
        global $SESSION, $APPLICATION;

        $control = $APPLICATION->FUNCTIONS->INVENTORY_CONTROL;
        $reportControl = $APPLICATION->FUNCTIONS->INVENTORY_REPORT_ITEM_CONTROL;

        $allItems = $control->getAllRecords(true);

        $data['user_id'] = $SESSION->user_id;

        $insert = $this->addRecord($data);

        if ($insert->code == 200) {
            $id = $insert->body['id'];

            $records = array_map(function ($item) use ($id) {
                return [
                    "item_id" => $item->item_id,
                    "quantity" => $item->stocks,
                    "inventory_id" => $id,
                    "item_status" => $item->item_status,
                    "person_involved" => $item->person_involved,
                    "quantity_involved" => $item->quantity_involved,
                    "date_involved" => $item->date_involved,
                    "status_description" => $item->status_description,
                ];
            }, $allItems);

            foreach ($records as $record) {
                $reportControl->addRecord($record);
            }
        }

        return $insert;
    }
}