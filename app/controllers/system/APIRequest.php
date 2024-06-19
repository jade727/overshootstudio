<?php

namespace Application\controllers\system;

use Application\controllers\app\Response;
use \ZipArchive;

class APIRequest
{
    public function run($request) {
        return $this->$request();
    }


    public function ChangeRequestStatus() {
        global $APPLICATION;

        $control = $APPLICATION->FUNCTIONS->REQUEST_CONTROL;
    }

    public function CompleteRequest() {
        global $APPLICATION, $SESSION;

        $ref = GenUUIDV4();
        $id = $_POST['id'];
        $isWalkIN = filter_var($_POST['isWalkIN'], FILTER_VALIDATE_BOOLEAN);
        $filenames = json_decode($_POST['filenames'], true);

        $control = $APPLICATION->FUNCTIONS->REQUEST_CONTROL;
        $controlWalk = $APPLICATION->FUNCTIONS->WALKIN_CONTROL;
        $resultImageSetControl = $APPLICATION->FUNCTIONS->RESULT_IMAGE_SET_CONTROL;
        $resultImageControl = $APPLICATION->FUNCTIONS->RESULT_IMAGE_CONTROL;

        $data = [
            "request_id" => $id,
            "user_id" => $SESSION->user_id,
            "reference" =>  $ref,
            "is_walkin" => $isWalkIN,
        ];

         $insert = $resultImageSetControl->addRecord($data);

         if ($insert->code === 200) {

             if ($isWalkIN) {
                 $controlWalk->editRecord($id, ["status" => 5]);
             } else {
                 $control->editRecord($id, ["status" => 5]);
             }

             foreach ($filenames as $filename) {
                 $resultImageControl->addRecord([
                     "image" => $filename,
                     "reference" => $ref,
                 ]);
             }
         }

        return new Response($insert->code === 200 ? 200 : 204, $insert->code === 200 ? "Successfully Submitted" : "Submission Failed!");

    }


    public function GetPackage() {
        global $APPLICATION;

        $id = $_POST['id'];
        $control = $APPLICATION->FUNCTIONS->PACKAGE_CONTROL;

        return $control->get($id, true);
    }

    function DownloadSet()
    {
        global $APPLICATION;

        $id = $_POST['requestID'];

        $control = $APPLICATION->FUNCTIONS->REQUEST_CONTROL;
        $request = $control->get($id, true);

        $results = $request->getResult();

        if (count($results->images) > 0) {
            $files = array_map(function ($result) {
                $type = pathinfo($result->image, PATHINFO_EXTENSION);
                $data = file_get_contents($result->image);
                return [
                    "name" => basename($result->image),
                    "data" => base64_encode($data)
                ];
            }, $results->images);

            return $files;
//
//            $this->createZipAndDownload($files, '/public/assets/media/uploads/', GenUUIDV4() . '.zip');
//            $tmpFile = tempnam('/tmp', '');
//
//            $zip = new \ZipArchive;
//            $zip->open($tmpFile, \ZipArchive::CREATE);
//
//
//            foreach ($files as $file) {
//                // download file
//                $fileContent = file_get_contents($file);
//
//                $zip->addFromString(basename($file), $fileContent);
//            }
//
//            $zip->close();
//
//            header('Content-Type: application/zip');
//            header('Content-disposition: attachment; filename=file.zip');
//            header('Content-Length: ' . filesize($tmpFile));
//
//            readfile($tmpFile);
//
//            unlink($tmpFile);
        }
    }

    function createZipAndDownload($files, $filesPath, $zipFileName)
    {
        // Create instance of ZipArchive. and open the zip folder.
        $zip = new \ZipArchive();

        if ($zip->open($zipFileName, \ZipArchive::CREATE) !== TRUE) {
            exit("cannot open <$zipFileName>\n");
        }

        // Adding every attachments files into the ZIP.
        foreach ($files as $file) {
            $zip->addFile($filesPath . $file, $file);
        }

        $zip->close();

        // Download the created zip file
        header("Content-type: application/zip");
        header("Content-Disposition: attachment; filename = $zipFileName");
        header("Pragma: no-cache");
        header("Expires: 0");
        readfile("$zipFileName");
        exit;
    }
}