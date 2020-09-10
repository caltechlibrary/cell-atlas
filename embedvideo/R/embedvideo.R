#' embedvideo
#'
#' Embed Video player
#'
#' @import htmlwidgets
#'
#' @export
embedvideo <- function(media_location, width = NULL, height = NULL, elementId = NULL) {

  # forward options using x
  x = list(
    media_location = media_location
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'embedvideo',
    x,
    width = '100%',
    height = '100%',
    package = 'embedvideo',
    elementId = elementId,
    sizingPolicy = htmlwidgets::sizingPolicy(padding = 0, browser.fill = TRUE, knitr.figure = FALSE)
  )
}

#' Shiny bindings for doivideo
#'
#' Output and render functions for using doivideo within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a doivideo
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name doivideo-shiny
#'
#' @export
#doivideoOutput <- function(outputId, width = '100%', height = '400px'){
#  htmlwidgets::shinyWidgetOutput(outputId, 'doivideo', width, height, package = 'doivideo')
#}

#' @rdname doivideo-shiny
#' @export
#renderDoivideo <- function(expr, env = parent.frame(), quoted = FALSE) {
#  if (!quoted) { expr <- substitute(expr) } # force quoted
#  htmlwidgets::shinyRenderWidget(expr, doivideoOutput, env, quoted = TRUE)
#}
