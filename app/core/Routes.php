<?php

namespace Application\core;

use Application\abstracts\MessageAbstract;
use Application\controllers\system\MessageControl;
use Response;

class Routes
{
    protected $KLEIN;
    protected $CONNECT;
    protected $SESSION;
    protected $APPLICATION;

    public function __construct($APPLICATION)
    {
        global $CONNECTION;
        global $KLEIN;
        global $SESSION;

        $this->CONNECT = $CONNECTION;
        $this->KLEIN = $KLEIN;
        $this->SESSION = $SESSION;
        $this->APPLICATION = $APPLICATION;
    }

    public function loadRoutes(): void
    {
        $KLEIN = $this->KLEIN;

        $this->loadWebRoutes();
        $this->authenticationRoutes();
//        $this->applicationRoutes();
        $this->apiRoutes();
        $this->toolRoutes();
        $this->componentsRoutes();
        $KLEIN->dispatch();
    }

    private  function loadWebRoutes(): void {
        $KLEIN = $this->KLEIN;
        $SESSION = $this->SESSION;

        $KLEIN->with(
            "/",
            function () use ($KLEIN, $SESSION) {
                $KLEIN->respond("GET", "?", function ($req, $res, $service) {
                    return $service->render( "public/views/pages/portal/web/" . "index" . ".phtml");
                });

                $KLEIN->respond(
                    "GET",
                    "[:page]",
                    function ($req, $res, $service) use ($SESSION) {
                        $view = $req->param("page");
                        $viewPath = "public/views/pages/portal/web/" . $view . ".phtml";
                        $exist = file_exists($viewPath);

                        if ($view !== "portal") {
                            if ($exist) {
                                return $service->render($viewPath);
                            }

                            return $service->render( "public/views/pages/portal/web/" . "index" . ".phtml");
                        }

                        $res->redirect("/portal/");
                    }
                );
            }
        );
    }

    private function authenticationRoutes(): void
    {
        $KLEIN = $this->KLEIN;
        $SESSION = $this->SESSION;

        if ($this->SESSION->hasUser) {
            $KLEIN->with("/portal", function () use ($KLEIN, $SESSION) {
                $KLEIN->respond("GET", "/?", function ($req, $res, $service) use ($SESSION) {
                    $type = strtolower($SESSION->typeName);

                    $defaultView = "public/views/pages/portal/account/$type/overview.phtml";

                    return $service->render($defaultView);
                });

                $KLEIN->respond("GET", "/[:page]", function ($req, $res, $service) use ($SESSION) {
                    $type = strtolower($SESSION->typeName);

                    $view = $req->param("page");
                    $viewPath = "public/views/pages/portal/account/".$type."/".$view.".phtml";
                    $defaultView = "public/views/pages/portal/account/$type/overview.phtml";
                    $logoutview = "public/views/pages/portal/account/logout.phtml";
                    $exist = file_exists($viewPath);

                    if (strtolower($view) === "logout") {
                        return $service->render($logoutview);
                    }

                    if ($exist) {
                        return $service->render($viewPath);
                    }

                    return $service->render($defaultView);
                });

                $KLEIN->respond("GET", "/[:page]/[:subpage]", function ($req, $res, $service) use ($SESSION) {
                    $type = strtolower($SESSION->typeName);

                    $view = $req->param("page");
                    $sub = $req->param("subpage");
                    $viewPath = "public/views/pages/portal/account/".$type."/$view/".$sub.".phtml";
                    $defaultView = "public/views/pages/portal/account/$type/overview.phtml";
                    $logoutview = "public/views/pages/portal/account/logout.phtml";
                    $exist = file_exists($viewPath);

                    if (strtolower($view) === "logout") {
                        return $service->render($logoutview);
                    }

                    if ($exist) {
                        return $service->render($viewPath);
                    }

                    return $service->render($defaultView);
                });
            });
        } else {

            $KLEIN->with("/portal", function () use ($KLEIN, $SESSION) {
                $KLEIN->respond("GET", "?", function ($req, $res) use ($SESSION) {
                    if (!$SESSION->hasUser) {
                        $res->redirect("/portal/auth/login");
                    }
                });

                // authentication

                $KLEIN->respond("GET", "[!@^auth/admin/|!@^auth/login/|!@^auth/createAccount/]", function ($req, $res) {
                    return $res->redirect("/portal/auth/login");
                });

                $KLEIN->with("/auth", function () use ($KLEIN, $SESSION) {
                    $KLEIN->respond(
                        "GET",
                        "/[:page]",
                        function ($req, $res, $service) use ($SESSION) {
                            $view = $req->param("page");
                            $viewPath = "public/views/pages/auth/" . $view . ".phtml";
                            $exist = file_exists($viewPath);

                            if ($exist) {
                                return $service->render($viewPath);
                            } else {
                                $res->redirect("/portal/auth/login");
                            }
                        }
                    );

                    $KLEIN->respond(
                        "GET",
                        "[/?|!@^/login|!@^/admin|!@^/createAccount]",
                        function ($req, $res) use ($SESSION) {
                            if ($SESSION->hasUser) {
                                $res->redirect("/user/");
                            } else {
                                return $res->redirect("/portal/auth/auth");
                            }
                        }
                    );
                });
            });


        }
    }

    private function applicationRoutes(): void
    {
        $KLEIN = $this->KLEIN;

        $this->KLEIN->with("", static function () use ($KLEIN) {
            $defaultView = "public/views/pages/dashboard.phtml";

            $KLEIN->respond(
                "GET",
                "/?",
                static function ($req, $res, $service) use ($defaultView) {
                    return $service->render($defaultView, ["view_path" => "/"]);
                }
            );

            $KLEIN->respond(
                "GET",
                "/[:view]",
                static function ($req, $res, $service) use ($defaultView) {
                    $view = "public/views/pages/" . $req->param("view") . ".phtml";
                    return $service->render(file_exists($view) ? $view : $defaultView, ["view_path" => $req->param("view")]);
                }
            );

            $KLEIN->respond(
                "GET",
                "/[:view]/[:subview]",
                static function ($req, $res, $service) use ($defaultView) {
                    $view = "public/views/pages/" . $req->param("view") . "/" .$req->param("subview"). ".phtml";

                    return $service->render(file_exists($view) ? $view : $defaultView, ["view_path" => $req->param("view") . "/" .$req->param("subview")]);
                }
            );
        });
    }

    private function apiRoutes(): void
    {
        $KLEIN = $this->KLEIN;
        $APPLICATION = $this->APPLICATION;
        $SESSION = $this->SESSION;

        $this->KLEIN->with("/api", function () use ($KLEIN, $APPLICATION, $SESSION) {
            $this->KLEIN->with("/auth", function() use ($KLEIN, $APPLICATION){
                $KLEIN->respond("POST","/login", function () use ($APPLICATION) {
                    return json_encode($APPLICATION->AUTHENTICATION->LoginSession($_POST['username'], $_POST['password'],(int) $_POST['user_type']), true);
                });

                $KLEIN->respond("POST","/register", function () use ($APPLICATION) {
                    return json_encode($APPLICATION->AUTHENTICATION->Register(json_decode($_POST['data'], true), (int) $_POST['user_type']), true);
                });
            });

            $this->KLEIN->with("/admin", function () use ($KLEIN, $APPLICATION) {
                $KLEIN->respond("/[:view]/updateRecords", function ($req, $res, $service) {
                    return $service->render("public/views/components/popup/" . $req->param("view") . '/updateRecords.phtml');
                }
                );

                $KLEIN->respond("/[:view]/searchRecords", function ($req, $res, $service) {
                    return $service->render("public/views/components/popup/" . $req->param("view") . '/searchRecords.phtml');
                }
                );

                $KLEIN->respond("/[:view]/filterRecords", function ($req, $res, $service) {
                    return $service->render("public/views/components/popup/" . $req->param("view") . '/filterRecords.phtml');
                }
                );

                $KLEIN->with("/packages", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->PACKAGE_CONTROL->addRecord(json_decode($_POST['data'], true)),true);
                    });
                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->PACKAGE_CONTROL->editRecord($_POST['id'], json_decode($_POST['data'], true)),true);
                    });
                    $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->PACKAGE_CONTROL->removeRecords(json_decode($_POST['data'], true)),true);
                    });
                });

                $KLEIN->with("/requests", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->REQUEST_CONTROL->add(json_decode($_POST['data'], true), json_decode($_POST['paymentData'], true)),true);
                    });

                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                        if (isset($_POST['change_status'])) {
                            return json_encode($APPLICATION->FUNCTIONS->REQUEST_CONTROL->changeStatus($_POST['id'], json_decode($_POST['data'], true)),true);
                        } else {
                            return json_encode($APPLICATION->FUNCTIONS->REQUEST_CONTROL->editRecord($_POST['id'], json_decode($_POST['data'], true)),true);

                        }
                    });

                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                    });


                    $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->REQUEST_CONTROL->removeRecords(json_decode($_POST['data'], true)),true);
                    });
                });

                $KLEIN->with("/walkin", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->WALKIN_CONTROL->add(json_decode($_POST['data'], true)),true);
                    });

                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->WALKIN_CONTROL->editRecord($_POST['id'], json_decode($_POST['data'], true)),true);
                    });
                    $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->WALKIN_CONTROL->removeRecords(json_decode($_POST['data'], true)),true);
                    });
                });

                $KLEIN->with("/inventory", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->INVENTORY_CONTROL->addRecord(json_decode($_POST['data'], true)),true);
                    });

                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->INVENTORY_CONTROL->editRecord($_POST['id'], json_decode($_POST['data'], true)),true);
                    });
                    $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->INVENTORY_CONTROL->removeRecords(json_decode($_POST['data'], true)),true);
                    });
                });

                $KLEIN->with("/inventory_report", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->INVENTORY_REPORT_CONTROL->add(json_decode($_POST['data'], true)),true);
                    });

                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->INVENTORY_REPORT_CONTROL->editRecord($_POST['id'], json_decode($_POST['data'], true)),true);
                    });
                    $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->INVENTORY_REPORT_CONTROL->removeRecords(json_decode($_POST['data'], true)),true);
                    });
                });

                $KLEIN->with("/other_payments", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->OTHER_PAYMENT_CONTROL->add($_POST['id'], json_decode($_POST['data'], true)),true);
                    });
                });

                $KLEIN->with("/user_password", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->USER_CONTROL->updatePassword(json_decode($_POST['data'], true)),true);
                    });
                });

                $KLEIN->with("/dbstatus", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->USER_CONTROL->updateDBStatus($_POST['type'], $_POST['primary'], json_decode($_POST['ids'], true)),true);
                    });
                });

                $KLEIN->with("/users", function() use ($KLEIN, $APPLICATION) {
                    $KLEIN->respond("POST", "/addRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->USER_CONTROL->add(json_decode($_POST['data'], true)),true);
                    });

                    $KLEIN->respond("POST", "/editRecord", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->USER_CONTROL->edit($_POST['id'], json_decode($_POST['data'], true)),true);
                    });

                    $KLEIN->respond("POST", "/removeRecords", function () use ($APPLICATION){
                        return json_encode($APPLICATION->FUNCTIONS->USER_CONTROL->removeRecords(json_decode($_POST['data'], true)),true);
                    });
                });
            });

            $this->KLEIN->with("/post", function () use ($KLEIN, $APPLICATION) {
                $KLEIN->respond("POST", "/[:request]", function ($req) use ($APPLICATION) {
                    return json_encode($APPLICATION->FUNCTIONS->API_REQUEST->run($req->param("request")));
                });
            });

        });
    }

    private function componentsRoutes(): void
    {
        $KLEIN = $this->KLEIN;

        $KLEIN->respond("POST", "/components/popup/[:folder]?/[:view]?", static function ($req, $res, $service) use ($KLEIN) {
            $mainPath = "public/views/components/popup/" . $req->param("folder") . '/';
            $view = $mainPath . $req->param("view") . '.phtml';
            return file_exists($view) ? $service->render($view) : null;
        });

        $KLEIN->respond("POST", "/components/containers/[:folder]?/[:view]?", static function ($req, $res, $service) use ($KLEIN) {
            $mainPath = "public/views/components/containers/" . $req->param("folder") . '/';
            $view = $mainPath . $req->param("view") . '.phtml';
            return file_exists($view) ? $service->render($view) : null;
        });
    }

    private function toolRoutes()
    {
        $KLEIN = $this->KLEIN;

        $KLEIN->with("/tool", function () use ($KLEIN) {
            $KLEIN->respond(
                "POST",
                "/uploadImageFromFile",
                function () {
                    return json_encode(UploadImageFromFile($_FILES['file'], $_POST["filename"], $_POST['destination']), JSON_THROW_ON_ERROR);
                }
            );

            $KLEIN->respond(
                "POST",
                "/uploadImageFromPath",
                function () {
                    return json_encode(UploadImageFromPath($_POST['path'], $_POST["filename"], $_POST['destination']), JSON_THROW_ON_ERROR);
                }
            );

            $KLEIN->respond(
                "POST",
                "/uploadImageFromBase64",
                function () {
                    return json_encode(UploadImageFromBase64($_POST['base64'], $_POST['destination'], $_POST["filename"], $_POST['extension'] ?? 'jpg'), JSON_THROW_ON_ERROR);
                }
            );

            $KLEIN->respond(
                "POST",
                "/UploadFileFromFile",
                function () {
                    return json_encode(UploadFileFromFile($_FILES['file'], $_POST['destination'], $_POST['filename']), JSON_THROW_ON_ERROR);
                }
            );
        });
    }
}