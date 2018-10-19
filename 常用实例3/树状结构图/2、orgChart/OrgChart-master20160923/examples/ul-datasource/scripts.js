

    $('#chart-container').orgchart({
          'data' : $('#ul-data'),
          'nodeContent': 'title',
          'draggable': true,
          'dropCriteria': function($draggedNode, $dragZone, $dropZone) {
            if($draggedNode.find('.content').text().indexOf('manager') > -1 && $dropZone.find('.content').text().indexOf('engineer') > -1) {
              return false;
            }
            return true;
          }
        })
        .children('.orgchart').on('nodedropped.orgchart', function(event) {
      console.log('draggedNode:' + event.draggedNode.children('.title').text()
          + ', dragZone:' + event.dragZone.children('.title').text()
          + ', dropZone:' + event.dropZone.children('.title').text()
      );
    });
