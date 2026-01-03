package com.intellieffect.drop.mobile.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.intellieffect.drop.mobile.R

class GalleryWidgetProvider : BaseWidgetProvider() {
    override val layoutId = R.layout.widget_gallery
    override val deepLinkPath = "gallery"

    override fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, layoutId)

        val pendingIntent = createDeepLinkIntent(context, deepLinkPath)
        views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
