// setBlockSelection() is highlight the active tile with some background
var setBlockSelection = function(elem) {
    var $parentBlock = $(elem).closest('.product-block');
    var blockCheckedCount = $parentBlock.find('.checkbox input[type="checkbox"]:checked').length;
    var isActive = 0;
    if (blockCheckedCount > 0) {
        isActive += 1;
        console.log('checkbox count is' + isActive)
    }

    if (isActive) {
        $parentBlock.addClass("newproductblock");
        $parentBlock.find('.ms-choice').attr("disabled", false);
    } else {
        $parentBlock.removeClass("newproductblock");
        $parentBlock.find('.ms-choice').attr("disabled", true);
        $parentBlock.find(".ms-choice span").text("Areas of Interest");
        $parentBlock.find('.selectionbox .ms-drop li input').prop('checked', false);
        $parentBlock.find('[class="multipleselect"]').val('none');
        $parentBlock.find('[class="multipleselect"]').multipleSelect();
    }
};
(function() {
    $(document).ready(function() {

        $(".ms-choice").attr("disabled", true);
        // var $slectbox =  $(".checkbox input[type='checkbox']:checked").closest(".ms-choice");
        // it will be triggered when we changed the value in the dropdown list
        $(".checkbox input[type='checkbox']").change(function() {
            setBlockSelection(this);
        });
        if ($(".checkbox input[type='checkbox']").is(":checked") == true) {
            var $defaultselected1 = $(".checkbox input[type='checkbox']:checked");
            $defaultselected1.closest('.product-block').addClass("newproductblock");
            //   $('.newproductblock').find('.product-meta .multipleselect').addClass("test");
            // $('.test .ms-choice').removeAttr('disabled');
            $('.newproductblock').find('.ms-choice').attr("disabled", false);
        }
    });
})()