import WidgetKit
import SwiftUI

struct DropWidgetEntry: TimelineEntry {
    let date: Date
}

struct DropWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> DropWidgetEntry {
        DropWidgetEntry(date: Date())
    }

    func getSnapshot(in context: Context, completion: @escaping (DropWidgetEntry) -> Void) {
        completion(DropWidgetEntry(date: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DropWidgetEntry>) -> Void) {
        let entry = DropWidgetEntry(date: Date())
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }
}

struct DropWidgetEntryView: View {
    var entry: DropWidgetProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            accessoryCircularView
        case .systemSmall:
            smallWidgetView
        default:
            smallWidgetView
        }
    }

    private var accessoryCircularView: some View {
        ZStack {
            AccessoryWidgetBackground()
            Image(systemName: "mic.fill")
                .font(.title2)
        }
        .widgetURL(URL(string: "drop://record"))
    }

    private var smallWidgetView: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(Color.accentColor.gradient)

            VStack(spacing: 8) {
                Image(systemName: "mic.fill")
                    .font(.largeTitle)
                    .foregroundStyle(.white)

                Text("DROP")
                    .font(.headline)
                    .foregroundStyle(.white)

                Text("음성 메모")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.8))
            }
        }
        .widgetURL(URL(string: "drop://record"))
    }
}

struct DropWidget: Widget {
    let kind: String = "DropWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DropWidgetProvider()) { entry in
            DropWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("DROP")
        .description("빠르게 음성 메모를 시작하세요")
        .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}

#Preview(as: .systemSmall) {
    DropWidget()
} timeline: {
    DropWidgetEntry(date: .now)
}

#Preview(as: .accessoryCircular) {
    DropWidget()
} timeline: {
    DropWidgetEntry(date: .now)
}
