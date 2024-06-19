<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\abstracts\InventoryItemAbstract;
use Application\models\InventoryItem;

class InventoryItemControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = InventoryItem::class;
    protected $TABLE_NAME = "inventory_items";
    protected $TABLE_PRIMARY_ID = "item_id";
    protected $SEARCH_LOOKUP = [];

    public function getAlRecordsWithDistinctColumn($column) {
        $records = $this->distinctColumn($column, [], false);
        $rr = [];

        foreach ($records as $record) {
            $rr[] = $record[$column];
        }

        return $rr;
    }
}