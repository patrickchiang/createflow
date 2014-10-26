var app = angular.module('createflow', []);


app.controller('IndexController', ['$scope', function ($scope) {

    $scope.getProjectsForUser = function () {
        $.ajax({
            type: 'GET',
            url: '/getProjectsForUser',
            success: function (projects) {
                $scope.userProjects = projects;

                $.each(projects, function (key, item) {
                    $.ajax({
                        type: 'GET',
                        url: '/getUsersForProject?project_id=' + projects[key].project_id,
                        success: function (users) {
                            $scope.userProjects[key].users = users;
                            $scope.userProjects = projects;
                            $scope.currentProject = $scope.userProjects[0];
                        }
                    });
                });

                $.each(projects, function (key, item) {
                    $.ajax({
                        type: 'GET',
                        url: '/getTasksFromProject?project_id=' + projects[key].project_id,
                        success: function (tasks) {
                            $scope.userProjects[key].tasks = tasks;
                            $scope.userProjects = projects;
                            $scope.currentProject = $scope.userProjects[0];

                            $.each(tasks, function (key2, item2) {
                                $.ajax({
                                    type: 'GET',
                                    url: '/getUsersForTask?task_id=' + tasks[key2].task_id,
                                    success: function (users2) {
                                        $scope.userProjects[key].tasks[key2].users = users2;
                                        $scope.userProjects = projects;
                                        $scope.currentProject = $scope.userProjects[0];
                                        $scope.$apply();
                                    }
                                });
                            });
                        }
                    });
                });
            }
        });

        $.ajax({
            type: 'GET',
            url: '/currentUser',
            success: function (user) {
                $scope.thisUser = user;
                $scope.$apply();
            }
        });

    };

    $scope.getTasksForProject = function () {
        $.ajax({
            type: 'GET',
            url: '/getProjectsForUser',
            success: function (projects) {
                $scope.userProjects = projects;
                $scope.currentProject = $scope.userProjects[0];
                $scope.$apply();
            }
        });
    };


    $scope.hoverProject = function (project) {
        return project.showDelete = !project.showDelete;
    };

    $scope.deleteProject = function (id, project_id) {
        $.ajax({
            type: 'POST',
            url: '/removeProject',
            data: {"project_id": project_id},
            success: function (data) {
                $scope.userProjects.splice(id, 1);
                $scope.$apply();
            }
        });
    };

    $scope.createProject = function (project_name, project_desc, project_endtime) {
        $.ajax({
            type: 'POST',
            url: '/addProjectToGroup',
            data: {
                "project_name": project_name,
                "project_desc": project_desc,
                "project_endtime": project_endtime.toISOString().slice(0, 19).replace('T', ' '),
                "group_id": 1
            },
            success: function (data) {
                $.ajax({
                    type: 'POST',
                    url: '/addUserToProject',
                    data: {
                        "user_id": $scope.thisUser.user_id,
                        "project_id": data
                    },
                    success: function (datad) {
                        $scope.userProjects.push({
                            "project_name": project_name,
                            "project_desc": project_desc,
                            "project_endtime": project_endtime,
                            "project_id": data,
                            "users": [$scope.thisUser]
                        });
                        console.log(project_endtime);

                        $scope.$apply();
                    }
                });
            }
        });
    };

    $scope.createTask = function (task_name, project_id) {
        $.ajax({
            type: 'POST',
            url: '/addTaskToProject',
            data: {
                "task_name": task_name,
                "project_id": project_id
            },
            success: function (data) {
                $scope.currentProject.tasks.push({
                    "task_name": task_name,
                    "user": []
                });

                $scope.$apply();
            }
        });
    };

    $scope.timeToDeadline = function (deadline) {
        if (typeof deadline == "object") {
            return Math.round((deadline - new Date()) / (1000 * 60 * 60 * 24));
        }
        if (deadline != null) {
            var days = (new Date(deadline.substring(0, 10)) - new Date()) / (1000 * 60 * 60 * 24);
            return Math.round(days);
        }
        return "";
    };

    $scope.clickProject = function (project) {
        $scope.currentProject = project;
    }

    $scope.getProjectsForUser();
}])
;