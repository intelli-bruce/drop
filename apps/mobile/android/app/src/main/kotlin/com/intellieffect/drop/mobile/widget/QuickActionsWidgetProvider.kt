package com.intellieffect.drop.mobile.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.intellieffect.drop.mobile.R

class QuickActionsWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_quick_actions)

        // Set click listeners for each button
        views.setOnClickPendingIntent(
            R.id.btn_memo,
            BaseWidgetProvider.createDeepLinkIntent(context, "memo")
        )
        views.setOnClickPendingIntent(
            R.id.btn_record,
            BaseWidgetProvider.createDeepLinkIntent(context, "record")
        )
        views.setOnClickPendingIntent(
            R.id.btn_camera,
            BaseWidgetProvider.createDeepLinkIntent(context, "camera")
        )
        views.setOnClickPendingIntent(
            R.id.btn_gallery,
            BaseWidgetProvider.createDeepLinkIntent(context, "gallery")
        )

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
