<?php

namespace Application\core;

use Klein\Klein;

class Application
{
    /**
     * @type Session
     */
    protected $SESSION;

    /**
     * @type Connection
     */
    protected $CONNECTION;
    /**
     * @type Klein
     */
    protected $KLEIN;

    protected $SERVICE;

    protected $ROUTES;

    public $AUTHENTICATION;
    public $FUNCTIONS;

    public function __construct($connect, $klein) {
        global $SESSION;

        $this->CONNECTION = $connect;
        $this->KLEIN = $klein;
        $this->SERVICE = $klein->service();

        $this->SESSION = $SESSION;
        $this->ROUTES = new Routes($this); // routes
        $this->AUTHENTICATION = new Authentication(); // auth // login | register
        $this->FUNCTIONS = new Functions($SESSION);
    }

    public function run()
    {
        global $CONNECTION, $KLEIN;

        if ($CONNECTION->Test()) {
            $this->ROUTES->loadRoutes();
        } else {
            $KLEIN->respond("GET", "/", function () {
                return "You don't have connection yet";
            });
        }
    }

    public function getKlein()
    {
        return $this->KLEIN;
    }

    public function getConnection()
    {
        return $this->CONNECTION;
    }

    public function getSession()
    {
        return $this->SESSION;
    }

    public function GoTo(string $url)
    {
        $this->KLEIN->response()->redirect($url);
    }

    public function GetAllData()
    {
        $allRequest = $this->FUNCTIONS->REQUEST_CONTROL->countRecords();
        $pending = $this->FUNCTIONS->REQUEST_CONTROL->countRecords(['status' => 1]);
        $accepted = $this->FUNCTIONS->REQUEST_CONTROL->countRecords(['status' => 2]);
        $decline = $this->FUNCTIONS->REQUEST_CONTROL->countRecords(['status' => 3]);


        $allUsers = count($this->FUNCTIONS->USER_CONTROL->filterRecords(['user_type' => 1, 'db_status' => 1], false));
        $allItems = count($this->FUNCTIONS->INVENTORY_CONTROL->filterRecords(['db_status' => '1'], false));
        $allRequestToday = $this->FUNCTIONS->REQUEST_CONTROL->countTodaysRecord([],"date_created", true);
        $pendingToday = $this->FUNCTIONS->REQUEST_CONTROL->countTodaysRecord(['status' => 1], "date_created", true);
        $acceptedToday = $this->FUNCTIONS->REQUEST_CONTROL->countTodaysRecord(['status' => 2], "date_created", true);
        $declineToday = $this->FUNCTIONS->REQUEST_CONTROL->countTodaysRecord(['status' => 3], "date_created", true);

        $allWalkIn = $this->FUNCTIONS->WALKIN_CONTROL->countTodaysRecord([],"date_created", true);
        $_pendingToday = $this->FUNCTIONS->WALKIN_CONTROL->countTodaysRecord(['status' => 1], "date_created", true);
        $_acceptedToday = $this->FUNCTIONS->WALKIN_CONTROL->countTodaysRecord(['status' => 2], "date_created", true);
        $_declineToday = $this->FUNCTIONS->WALKIN_CONTROL->countTodaysRecord(['status' => 3], "date_created", true);

        $walkIn = $this->FUNCTIONS->WALKIN_CONTROL->countTodaysRecord([], "date_created", true);
        return [
            "requests" => [
                "all" => $allRequest,
                "pending" => $pending,
                "accepted" => $accepted,
                "decline" => $decline
            ],
            "today" => [
                "all" => $allRequestToday,
                "pending" => $pendingToday,
                "accepted" => $acceptedToday,
                "decline" => $declineToday
            ],
            "users" => [
                'all' => $allUsers,
                'items' => $allItems
            ],
            "walkin" => [
                "all" => $allWalkIn,
                "pending" => $_pendingToday,
                "accepted" => $_acceptedToday,
                "decline" => $_declineToday
            ]
        ];

    }

    public function GetDataForSession()
    {
        global $SESSION;
        $allRequest = $this->FUNCTIONS->REQUEST_CONTROL->countRecords();
        $pending = $this->FUNCTIONS->REQUEST_CONTROL->countRecords(['status' => 1, 'user_id' => $SESSION->user_id]);
        $accepted = $this->FUNCTIONS->REQUEST_CONTROL->countRecords(['status' => 2, 'user_id' => $SESSION->user_id]);
        $decline = $this->FUNCTIONS->REQUEST_CONTROL->countRecords(['status' => 3, 'user_id' => $SESSION->user_id]);

        return [
            'all' => $allRequest,
            'pending' => $pending,
            'accepted' => $accepted,
            'decline' => $decline
        ];
    }
}