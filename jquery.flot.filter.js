/* Flot plugin to filter large data series to improve performance.

 Copyright (c) 2013 Andy May.
 Licensed under the MIT license.

 The plugin supports these options:

 filter: 'average'

 "filter" enables filtering on the series when the number of points to display in a
 series is greater than the number of available pixels on the x-axis. Setting it to
 'average' will cause the average value to be plotted rather than individual points.
 All other values will disable filtering.

 */

(function ($) {
	function init(plot) {
		function checkFilterEnabled(plot, options) {
			if (options.filter == 'average') {
				plot.hooks.drawSeries.push(filterSeries);
			}
		}

		function filterSeries(plot, canvascontext, series){
			var plotWidth = plot.width();
			var visiblePoints = getVisiblePoints(plot.getAxes().xaxis, series.data);

			if (visiblePoints.length > plotWidth) {
				var ratio = visiblePoints.length/plotWidth;
				var filteredPoints = [];

				for (var i=0; i<plotWidth; i++) {
					var pointsMin = Math.round(i*ratio);
					var stepSize = Math.round(ratio);
					var x = 0;
					var y = 0;

					for (var j=pointsMin;j<pointsMin+stepSize; j++) {
						x+=visiblePoints[j][0]/stepSize;
						y+=visiblePoints[j][1]/stepSize;
					}

					filteredPoints.push([ x, y ]);
				}

				visiblePoints = filteredPoints;
			}

			series.datapoints.points = getFlattenedPoints(visiblePoints);
		}

		function getVisiblePoints(xAxis, points) {
			var minIndex = getClosestValue(points, xAxis.min, 'lower');
			var maxIndex = getClosestValue(points, xAxis.max, 'upper');

			return points.slice(minIndex, maxIndex+1);
		}

		function getClosestValue(a, x, roundingType) {
			var lo = 0, hi = a.length-1;
			while (hi - lo > 1) {
				var mid = Math.round((lo + hi)/2);
				if (a[mid][0] <= x) {
					lo = mid;
				} else {
					hi = mid;
				}
			}
			if (a[lo][0] == x) hi = lo;
			if (roundingType == 'lower'){
				return a[lo][0];
			}
			else {
				return a[hi][0];
			}
		}

		function getFlattenedPoints(points) {
			var flattenedPoints = [];
			for (var i=0;i<points.length;i++) {
				flattenedPoints.push(points[i][0]);
				flattenedPoints.push(points[i][1]);
			}

			return flattenedPoints;
		}

		plot.hooks.processOptions.push(checkFilterEnabled);
	}

	var options = { filter:'' };

	$.plot.plugins.push({
		init: init,
		options: options,
		name: "filter",
		version: "0.1"
	});
})(jQuery);