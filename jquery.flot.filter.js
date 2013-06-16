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

			series.datapoints.points = getFlattenedPoints(visiblePoints, series.datapoints.pointsize);
		}

		function getVisiblePoints(xAxis, points) {
			if (xAxis.max < points[0][0] || xAxis.min > points[points.length-1][0])
				return [];

			var minIndex = getClosestValue(points, xAxis.min, 'lower');
			var maxIndex = getClosestValue(points, xAxis.max, 'upper');

			return points.slice(minIndex, maxIndex+1);
		}

		function getClosestValue(points, value, roundingType) {
			var lo = 0, hi = points.length-1;

			if (value < points[lo][0])
				return 0;

			if (value > points[hi][0])
				return points.length-1;

			while (hi - lo > 1) {
				var mid = Math.round((lo + hi)/2);
				if (points[mid][0] <= value)
					lo = mid;
				else
					hi = mid;
			}

			if (points[lo][0] == value)
				return lo;

			if (points[hi][0] == value)
				return hi;

			if (roundingType == 'lower')
				return lo;

			if (roundingType == 'upper')
				return hi;
		}

		function getFlattenedPoints(points, pointsize) {
			var flattenedPoints = [];

			for (var i=0;i<points.length;i++) {
				for (var j=0;j<pointsize+1;j++) {
					flattenedPoints.push(points[i][j]);
				}
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
