<?php

namespace Application\controllers\system;

use Application\abstracts\ControlDefaultFunctions;
use Application\controllers\app\Response;
use Application\models\UserRequest;

class UserRequestControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = UserRequest::class;
    protected $TABLE_NAME = "user_requests";
    protected $TABLE_PRIMARY_ID = "request_id";
    protected $SEARCH_LOOKUP = [];

    public function add($requestData, $paymentData) {

        global $APPLICATION, $SESSION;

        $paymentControl = $APPLICATION->FUNCTIONS->PAYMENT_CONTROL;
        $emailControl = $APPLICATION->FUNCTIONS->EMAIL_CONTROL;

        $paymentData['user_id'] = $SESSION->user_id;

        $payment = $paymentControl->addRecord($paymentData);

        if ($payment->code === 200) {
            $requestData['payment_id'] = $payment->body['id'];
            $requestData['user_id'] = $SESSION->user_id;

            $insert = $this->addRecord($requestData);

            if ($insert->code == 200 ) {

                $sendEmail = $emailControl->sendTo($SESSION->email_address, "Booking Success", "You've successfully done payment for your booking, please be inform, to wait on your email, for the completion of your booking. \n \n Thank You, and have a wonderful day");

                if ($sendEmail) {
                    return new Response(200, "Request Successfully Sent!, please check your email");
                }
            }

            return new Response( 200,  "Request Successfully sent!");
        }

        return new Response( 204,  "Payment submission problem is encounter");

    }

    function changeStatus($id, $data)
    {
        global $APPLICATION;

        $emailControl = $APPLICATION->FUNCTIONS->EMAIL_CONTROL;
        $requestControl = $APPLICATION->FUNCTIONS->REQUEST_CONTROL;
        $userControl = $APPLICATION->FUNCTIONS->USER_CONTROL;

        $update = $this->editRecord($id, $data);
        $status = $data['status'];

        $request = $requestControl->get($id, true);
        $user  = $userControl->get($request->user_id, true);

        $emailAddress = $user->email_address;

        if ($status == 2) {
            $emailControl->sendTo($emailAddress, "Booking Approved", "Your Booking is Successfully Accepted. \n \n Thank You, and have a wonderful day");
        } else {
            $emailControl->sendTo($emailAddress, "Booking Declined", "Your Booking is Declined by Administrator. \n \n Thank You, and have a wonderful day");
        }

        return $update;
    }
}