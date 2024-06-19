<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\abstracts\PaymentAbstract;
use Application\models\Package;
use Application\models\Payment;
use Application\models\User;

class PaymentControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Payment::class;
    protected $TABLE_NAME = "payments";
    protected $TABLE_PRIMARY_ID = "payment_id";
    protected $SEARCH_LOOKUP = [];
}