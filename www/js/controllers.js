angular.module('conFusion.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout, $localStorage, $ionicPlatform, $cordovaCamera, $cordovaImagePicker) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject("userinfo", "{}");
    $scope.reservation = {};
    $scope.registration = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);
      $localStorage.storeObject("userinfo", $scope.loginData);
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };

    $ionicModal.fromTemplateUrl("templates/reserve.html", {
      scope: $scope
    }).then(function(modal) {
      $scope.reserveform = modal;
    });

    $scope.closeReserve = function() {
      $scope.reserveform.hide();
    };

    $scope.reserve = function() {
      $scope.reserveform.show();
    };
    $scope.doReserve = function() {
      console.log("Doing reservation", $scope.reservation);

      $timeout(function() {
        $scope.closeReserve();
      }, 1000);
    };

    $ionicModal.fromTemplateUrl("templates/register.html", {
      scope: $scope
    }).then(function(modal) {
      $scope.registerform = modal;
    });

    $scope.closeRegister = function() {
      $scope.registerform.hide();
    };

    $scope.register = function() {
      $scope.registerform.show();
    };

    $scope.doRegister = function() {
      console.log("Doing registration", $scope.registration);

      $timeout(function() {
        $scope.closeRegister();
      }, 1000);
    };

    $ionicPlatform.ready(function() {
      var cameraOptions = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      var galleryOptions = {
        maximumImagesCount: 1,
        width: 800,
        height: 800,
        quality: 80
      };

      $scope.takePicture = function() {
        $cordovaCamera.getPicture(cameraOptions).then(function(imageData) {
          $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
        }, function(err) {
          console.log(err);
        });
        $scope.registerform.show();
      };

      $scope.gallery = function() {
        $cordovaImagePicker.getPictures(galleryOptions).then(function(results) {
          $scope.registration.imgSrc = results[0];
        }, function(err) {
          console.log(err);
        });
        $scope.registerform.show();
      };
    })
  })


  .controller('MenuController', ['$scope', "favoriteFactory", "baseURL", "dishes", "$ionicListDelegate", "$ionicPlatform", "$cordovaLocalNotification", "$cordovaToast", function($scope, favoriteFactory, baseURL, dishes, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;

    $scope.dishes = dishes;

    $scope.select = function(setTab) {
      $scope.tab = setTab;

      if (setTab === 2) {
        $scope.filtText = "appetizer";
      } else if (setTab === 3) {
        $scope.filtText = "mains";
      } else if (setTab === 4) {
        $scope.filtText = "dessert";
      } else {
        $scope.filtText = "";
      }
    };

    $scope.isSelected = function(checkTab) {
      return ($scope.tab === checkTab);
    };

    $scope.toggleDetails = function() {
      $scope.showDetails = !$scope.showDetails;
    };
    $scope.addFavorite = function(index) {
      console.log("index is " + index);

      favoriteFactory.addToFavorites(index);
      $ionicListDelegate.closeOptionButtons();

      $ionicPlatform.ready(function() {
        $cordovaLocalNotification.schedule({
          id: 1,
          title: "Added Favorite",
          text: $scope.dishes[index].name
        }).then(function() {
          console.log("Added Favorite" + $scope.dishes[index].name);
        }, function() {
          console.log("Failed to add Favorite");
        });

      $cordovaToast
        .show("Added Favorite" + $scope.dishes[index].name, "long", "center")
        .then(function(success) {
          // success
        }, function(error) {
          // error
        });
      });
    }
  }])

  .controller('ContactController', ['$scope', function($scope) {

    $scope.feedback = {
      mychannel: "",
      firstName: "",
      lastName: "",
      agree: false,
      email: ""
    };

    var channels = [{
      value: "tel",
      label: "Tel."
    }, {
      value: "Email",
      label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

  }])

  .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope, feedbackFactory) {

    $scope.sendFeedback = function() {

      console.log($scope.feedback);

      if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
        $scope.invalidChannelSelection = true;
        console.log('incorrect');
      } else {
        $scope.invalidChannelSelection = false;
        feedbackFactory.save($scope.feedback);
        $scope.feedback = {
          mychannel: "",
          firstName: "",
          lastName: "",
          agree: false,
          email: ""
        };
        $scope.feedback.mychannel = "";
        $scope.feedbackForm.$setPristine();
        console.log($scope.feedback);
      }
    };
  }])

  .controller('DishDetailController', ['$scope', '$stateParams', "dish", 'menuFactory', "favoriteFactory", "$ionicPopover", "$ionicModal", "$ionicPlatform", "$cordovaLocalNotification", "$cordovaToast", "baseURL", function($scope, $stateParams, dish, menuFactory, favoriteFactory, $ionicPopover, $ionicModal, $ionicPlatform, $cordovaLocalNotification, $cordovaToast, baseURL) {

    $scope.baseURL = baseURL;
    $scope.dish = dish;

    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
      $scope.popover.show($event);
    };
    $scope.closePopover = function() {
      $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });

    $scope.addFavorite = function() {
      console.log("index is " + $stateParams.id);

      favoriteFactory.addToFavorites($stateParams.id);
      $scope.popover.hide();

      $ionicPlatform.ready(function() {
        $cordovaLocalNotification.schedule({
          id: 1,
          title: "Added Favorite",
          text: $scope.dish.name
        }).then(function() {
          console.log("Added Favorite" + $scope.dish.name);
        }, function() {
          console.log("Failed to add Favorite");
        });

        $cordovaToast
          .show("Added Favorite" + $scope.dish.name, "long", "center")
          .then(function(success) {
            // success
          }, function(error) {
            // error
          });
      });
    };

    $ionicModal.fromTemplateUrl('../templates/dish-comment.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
      $scope.popover.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
  }])

  .controller('DishCommentController', ['$scope', 'menuFactory', function($scope, menuFactory) {

    $scope.mycomment = {
      rating: 5,
      comment: "",
      author: "",
      date: ""
    };

    $scope.submitComment = function() {

      $scope.mycomment.date = new Date().toISOString();
      console.log($scope.mycomment);

      $scope.dish.comments.push($scope.mycomment);
      menuFactory.getDishes().update({
        id: $scope.dish.id
      }, $scope.dish);

      $scope.commentForm.$setPristine();

      $scope.mycomment = {
        rating: 5,
        comment: "",
        author: "",
        date: ""
      };

      $scope.closeModal();

    }
  }])

  // implement the IndexController and About Controller here

  .controller('IndexController', ['$scope', "baseURL", "dish", "promotion", "leader", function($scope, baseURL, dish, promotion, leader) {

    $scope.baseURL = baseURL;
    $scope.leader = leader;
    $scope.dish = dish;
    $scope.promotion = promotion;

  }])


  .controller('AboutController', ['$scope', 'baseURL', "leaders", function($scope, baseURL, leaders) {
    $scope.baseURL = baseURL;
    $scope.leaders = leaders;

  }])

  .controller("FavoritesController", ["$scope", "dishes", "favorites", "favoriteFactory", "baseURL", "$ionicListDelegate", "$ionicPopup", "$ionicLoading", "$timeout", "$ionicPlatform","$cordovaVibration", function($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $ionicPlatform, $cordovaVibration) {
    $scope.baseURL = baseURL;
    $scope.shoudShowDelete = false;

    $scope.favorites = favorites;
    $scope.dishes = dishes;

    console.log($scope.dishes, $scope.favorites);

    $scope.toggleDelete = function() {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
      console.log($scope.shouldShowDelete);
    }

    $scope.deleteFavorite = function(index) {
      var confirmPopup = $ionicPopup.confirm({
        title: "Confirm Delete",
        template: "Are you sure you want to delete this item?"
      });

      confirmPopup.then(function(res) {
        if (res) {
          console.log("ok to delete");
          favoriteFactory.deleteFromFavorites(index);
          $ionicPlatform.ready(function() {
            $cordovaVibration.vibrate(100);
          });
        } else {
          console.log("Canceled delete");
        }

      })

      $scope.shouldShowDelete = false;
    }

  }])

  .filter("favoriteFilter", function() {
    return function(dishes, favorites) {
      var out = [];
      for (i = 0; i < favorites.length; i++) {
        for (var j = 0; j < dishes.length; j++) {
          if (dishes[j].id == favorites[i].id) {
            out.push(dishes[j]);
          }
        }
      }
      return out;
    }
  });
