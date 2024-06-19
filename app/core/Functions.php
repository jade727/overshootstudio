<?php

namespace Application\core;

use Application\controllers\app\EmailControl;
use Application\controllers\system\APIRequest;
use Application\controllers\system\InventoryControl;
use Application\controllers\system\InventoryItemControl;
use Application\controllers\system\InventoryReportItemControl;
use Application\controllers\system\OtherPaymentControl;
use Application\controllers\system\PackageControl;
use Application\controllers\system\PaymentControl;
use Application\controllers\system\ResultImageControl;
use Application\controllers\system\UserControl;
use Application\controllers\system\UserRequestControl;
use Application\controllers\system\RequestImageSetControl;
use Application\controllers\system\WalkInControl;

class Functions
{

    public $EMAIL_CONTROL;
    public $API_REQUEST;

    public $USER_CONTROL;
    public $PACKAGE_CONTROL;
    public $REQUEST_CONTROL;
    public $PAYMENT_CONTROL;
    public $RESULT_IMAGE_SET_CONTROL;
    public $RESULT_IMAGE_CONTROL;
    public $WALKIN_CONTROL;
    public $INVENTORY_CONTROL;

    public $INVENTORY_REPORT_CONTROL;

    public $INVENTORY_REPORT_ITEM_CONTROL;
    public $OTHER_PAYMENT_CONTROL;

    public function __construct()
    {
        $this->EMAIL_CONTROL = new EmailControl();
        $this->API_REQUEST = new APIRequest();
        $this->USER_CONTROL = new UserControl();
        $this->PACKAGE_CONTROL = new PackageControl();
        $this->REQUEST_CONTROL = new UserRequestControl();
        $this->PAYMENT_CONTROL = new PaymentControl();
        $this->RESULT_IMAGE_SET_CONTROL = new RequestImageSetControl();
        $this->RESULT_IMAGE_CONTROL = new ResultImageControl();
        $this->WALKIN_CONTROL = new WalkInControl();
        $this->INVENTORY_CONTROL = new InventoryItemControl();
        $this->INVENTORY_REPORT_CONTROL = new InventoryControl();
        $this->INVENTORY_REPORT_ITEM_CONTROL = new InventoryReportItemControl();
        $this->OTHER_PAYMENT_CONTROL = new OtherPaymentControl();
    }
}