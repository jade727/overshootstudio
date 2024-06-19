<?php

namespace Application\abstracts;

use Application\controllers\app\Response;
use ReflectionClass;
use ReflectionException;
use Application\models;

abstract class ControlDefaultFunctions
{
    protected $SESSION;
    protected $KLEIN;
    protected $CONNECTION;

    protected $TABLE_NAME;
    protected $TABLE_PRIMARY_ID;
    protected $SEARCH_LOOKUP = [];
    protected $MODEL_CLASS;

     public function __construct()
    {
        global $SESSION;
        global $KLEIN;
        global $CONNECTION;

        $this->SESSION = $SESSION;
        $this->KLEIN = $KLEIN;
        $this->CONNECTION = $CONNECTION;
    }

    /**
     * @throws ReflectionException
     */
    public function newInstanceOfModel($record) {
        return (new ReflectionClass($this->MODEL_CLASS))->newInstance($record);
    }

    public function getTablePrimaryID()
    {
        return $this->TABLE_PRIMARY_ID;
    }

    /**
     * @throws ReflectionException
     */
    public function get($ID, $AS_OBJECT)
    {
        $activity = $this->CONNECTION->Select($this->TABLE_NAME, [$this->TABLE_PRIMARY_ID => $ID], false);
        return $AS_OBJECT ? $this->newInstanceOfModel($activity) : $activity;
    }

    public function getQuery($DATA, $AS_OBJECT){
        $activity = $this->CONNECTION->Select($this->TABLE_NAME, $DATA, false);
        return $AS_OBJECT ? $this->newInstanceOfModel($activity) : $activity;
    }

    public function addRecord($activity)
    {
        $insert = $this->CONNECTION->Insert($this->TABLE_NAME, $activity, true);

        return new Response($insert ? 200 : 204, $insert ? "Data Successfully Inserted" : "Activity has an error", ['id' => $insert]);
    }

    public function addRecordRemoveIfExist($activity)
    {
        $already = $this->alreadyExists($activity);

        if ($already->code == 204) {
            $insert = $this->CONNECTION->Insert($this->TABLE_NAME, $activity, true);
            return new Response($insert ? 200 : 204, $insert ? "Data Successfully Inserted" : "Activity has an error", ['id' => $insert]);
        }

        $remove = $this->removeRecord($already->body['id']);

        return new Response($remove ? 200 : 204, $remove ? "Data Successfully Deleted" : "UnFavorite has an error", ['id' => -1]);
    }

    public function alreadyExists($record)
    {
        $ID = $this->CONNECTION->Exist($this->TABLE_NAME, $record, $this->TABLE_PRIMARY_ID);

        return new Response($ID ? 200 : 204, $ID ? "Already Exists" : "Not Exists", ["id" => $ID]);
    }

    public function editRecord($id, $record)
    {
        $update = $this->CONNECTION->Update($this->TABLE_NAME, $record, [$this->TABLE_PRIMARY_ID => $id]);
        return new Response($update ? 200 : 204, $update ? "Successfully Edited" : "Updating encounter an error");
    }

    public function removeRecord($id)
    {
        $remove = $this->CONNECTION->Update($this->TABLE_NAME, ["db_status" => \DB_STATUS::REMOVED->value], [$this->TABLE_PRIMARY_ID => $id]);
        return new Response($remove ? 200 : 204, $remove ? "Successfully Removed" : "Removing encounter an error");
    }

    public function removeRecordOfficially($id)
    {
        $remove = $this->CONNECTION->Delete($this->TABLE_NAME, [$this->TABLE_PRIMARY_ID => $id]);
        return new Response($remove ? 200 : 204, $remove ? "Successfully Removed" : "Removing encounter an error");
    }

    public function removeRecords($ids)
    {
        $success = 0;
        $failed = 0;

        foreach ($ids as $id) {
            $remove = $this->removeRecord($id);

            if ($remove->code === 200) {
                $success++;
            } else {
                $failed++;
            }
        }

        return new Response($success > 0  ? 200 : 204, $success > 0 ? $success . " Successfully Removed, " . $failed . ' Failed' : "Removing encounter an error");
    }

    public function getAllRecords($AS_OBJECT)
    {
        $records = $this->CONNECTION->SelectMultiCondition($this->TABLE_NAME, [['db_status', '!=', \DB_STATUS::REMOVED->value]], true);

        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }

    public function searchRecords($SEARCH, $AS_OBJECT, $WHERE = [])
    {
        $records = $this->CONNECTION->Search($this->TABLE_NAME, $SEARCH, $this->SEARCH_LOOKUP, $WHERE);

        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }

    public function countRecords($WHERE = null)
    {
        return count($this->CONNECTION->Select($this->TABLE_NAME, $WHERE, true));
    }


    public function getTodaysRecord($WHERE, $COLUMN, $FETCHALL)
    {
        return $this->CONNECTION->SelectToday($this->TABLE_NAME, $WHERE, $COLUMN, $FETCHALL);
    }

    public function countTodaysRecord($WHERE, $COLUMN, $FETCHALL)
    {
        return count($this->CONNECTION->SelectToday($this->TABLE_NAME, count($WHERE) > 0 ? $WHERE : null, $COLUMN, $FETCHALL));
    }
    public function filterRecords($WHERE, $AS_OBJECT): array
    {
        $filter = count($WHERE) > 0 ? $WHERE : [];

        $records = $this->CONNECTION->Select($this->TABLE_NAME, array_merge($filter, ['db_status_NOT_EQUALS' => \DB_STATUS::REMOVED->value])  , true);

        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }

    public function filterRecordsReal($WHERE, $AS_OBJECT): array
    {
        $filter = count($WHERE) > 0 ? $WHERE : null;

        $records = $this->CONNECTION->Select($this->TABLE_NAME, $filter  , true);

        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }

    public function distinctColumn($COLUMN, $WHERE, $AS_OBJECT): array
    {
        $records = $this->CONNECTION->SelectDistinctColumn($this->TABLE_NAME,$COLUMN, count($WHERE) > 0 ? $WHERE : [], true);
        return $AS_OBJECT ? array_map(/**
         * @throws ReflectionException
         */ function ($record) {
            return $this->newInstanceOfModel($record);
        }, $records) : $records;
    }
}