<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\abstracts\PaymentAbstract;
use Application\models\OtherPayment;
use Application\models\Package;
use Application\models\Payment;
use Application\models\User;

class OtherPaymentControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = OtherPayment::class;
    protected $TABLE_NAME = "other_payments";
    protected $TABLE_PRIMARY_ID = "payment_id";
    protected $SEARCH_LOOKUP = [];

    public function add($id, $data)
    {
        global $APPLICATION;

        $control = $APPLICATION->FUNCTIONS->REQUEST_CONTROL;
        $controlWalkin = $APPLICATION->FUNCTIONS->WALKIN_CONTROL;
        $otherPaymentControl = $APPLICATION->FUNCTIONS->OTHER_PAYMENT_CONTROL;

        $request = $data['is_walkin'] == 1 ? $controlWalkin->get($id, true) : $control->get($id, true);

        $data['user_id'] = $request->user_id;
        $data['request_id'] = $id;

        return $otherPaymentControl->addRecord($data);
    }
}