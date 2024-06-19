<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\abstracts\InventoryAbstract;
use Application\models\InventoryReportItem;

class InventoryReportItemControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = InventoryReportItem::class;
    protected $TABLE_NAME = "inventory_report_items";
    protected $TABLE_PRIMARY_ID = "inventory_item_id";
    protected $SEARCH_LOOKUP = [];
}