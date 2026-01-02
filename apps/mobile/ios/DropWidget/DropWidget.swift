import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

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

// MARK: - Shared Styles

private let accentBlue = Color(red: 74/255, green: 158/255, blue: 255/255)

private struct ActionButton: View {
    let icon: String
    let label: String
    let url: String
    
    var body: some View {
        Link(destination: URL(string: url)!) {
            VStack(spacing: 4) {
                ZStack {
                    Circle()
                        .fill(accentBlue)
                        .frame(width: 44, height: 44)
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundStyle(.white)
                }
                Text(label)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

// MARK: - Record Widget (Voice Memo)

struct RecordWidgetEntryView: View {
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
                .fill(accentBlue.gradient)

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

struct RecordWidget: Widget {
    let kind: String = "RecordWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DropWidgetProvider()) { entry in
            RecordWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("음성 메모")
        .description("빠르게 음성 메모를 시작하세요")
        .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}

// MARK: - Memo Widget (Text Note)

struct MemoWidgetEntryView: View {
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
            Image(systemName: "plus")
                .font(.title2)
        }
        .widgetURL(URL(string: "drop://memo"))
    }

    private var smallWidgetView: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(accentBlue.gradient)

            VStack(spacing: 8) {
                Image(systemName: "plus")
                    .font(.largeTitle)
                    .foregroundStyle(.white)

                Text("DROP")
                    .font(.headline)
                    .foregroundStyle(.white)

                Text("새 메모")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.8))
            }
        }
        .widgetURL(URL(string: "drop://memo"))
    }
}

struct MemoWidget: Widget {
    let kind: String = "MemoWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DropWidgetProvider()) { entry in
            MemoWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("새 메모")
        .description("빠르게 텍스트 메모를 작성하세요")
        .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}

// MARK: - Camera Widget

struct CameraWidgetEntryView: View {
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
            Image(systemName: "camera.fill")
                .font(.title2)
        }
        .widgetURL(URL(string: "drop://camera"))
    }

    private var smallWidgetView: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(accentBlue.gradient)

            VStack(spacing: 8) {
                Image(systemName: "camera.fill")
                    .font(.largeTitle)
                    .foregroundStyle(.white)

                Text("DROP")
                    .font(.headline)
                    .foregroundStyle(.white)

                Text("카메라")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.8))
            }
        }
        .widgetURL(URL(string: "drop://camera"))
    }
}

struct CameraWidget: Widget {
    let kind: String = "CameraWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DropWidgetProvider()) { entry in
            CameraWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("카메라")
        .description("빠르게 사진을 촬영하세요")
        .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}

// MARK: - Gallery Widget

struct GalleryWidgetEntryView: View {
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
            Image(systemName: "photo.on.rectangle")
                .font(.title2)
        }
        .widgetURL(URL(string: "drop://gallery"))
    }

    private var smallWidgetView: some View {
        ZStack {
            ContainerRelativeShape()
                .fill(accentBlue.gradient)

            VStack(spacing: 8) {
                Image(systemName: "photo.on.rectangle")
                    .font(.largeTitle)
                    .foregroundStyle(.white)

                Text("DROP")
                    .font(.headline)
                    .foregroundStyle(.white)

                Text("갤러리")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.8))
            }
        }
        .widgetURL(URL(string: "drop://gallery"))
    }
}

struct GalleryWidget: Widget {
    let kind: String = "GalleryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DropWidgetProvider()) { entry in
            GalleryWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("갤러리")
        .description("사진첩에서 이미지를 선택하세요")
        .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}

// MARK: - Quick Actions Widget (All 4 buttons)

private struct LargeActionButton: View {
    let icon: String
    let label: String
    let url: String
    
    var body: some View {
        Link(destination: URL(string: url)!) {
            VStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(accentBlue)
                        .frame(width: 64, height: 64)
                    Image(systemName: icon)
                        .font(.system(size: 28, weight: .medium))
                        .foregroundStyle(.white)
                }
                Text(label)
                    .font(.footnote)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
            }
        }
    }
}

struct QuickActionsWidgetEntryView: View {
    var entry: DropWidgetProvider.Entry

    var body: some View {
        HStack(spacing: 0) {
            LargeActionButton(icon: "plus", label: "메모", url: "drop://memo")
                .frame(maxWidth: .infinity)
            LargeActionButton(icon: "mic.fill", label: "녹음", url: "drop://record")
                .frame(maxWidth: .infinity)
            LargeActionButton(icon: "camera.fill", label: "카메라", url: "drop://camera")
                .frame(maxWidth: .infinity)
            LargeActionButton(icon: "photo.on.rectangle", label: "갤러리", url: "drop://gallery")
                .frame(maxWidth: .infinity)
        }
        .frame(maxHeight: .infinity)
    }
}

struct QuickActionsWidget: Widget {
    let kind: String = "QuickActionsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DropWidgetProvider()) { entry in
            QuickActionsWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("빠른 메모")
        .description("메모, 녹음, 카메라, 갤러리에 빠르게 접근하세요")
        .supportedFamilies([.systemMedium])
    }
}

// MARK: - Legacy alias for existing widget
typealias DropWidget = RecordWidget

// MARK: - Previews

#Preview("Record - Small", as: .systemSmall) {
    RecordWidget()
} timeline: {
    DropWidgetEntry(date: .now)
}

#Preview("Memo - Small", as: .systemSmall) {
    MemoWidget()
} timeline: {
    DropWidgetEntry(date: .now)
}

#Preview("Camera - Small", as: .systemSmall) {
    CameraWidget()
} timeline: {
    DropWidgetEntry(date: .now)
}

#Preview("Gallery - Small", as: .systemSmall) {
    GalleryWidget()
} timeline: {
    DropWidgetEntry(date: .now)
}

#Preview("Quick Actions - Medium", as: .systemMedium) {
    QuickActionsWidget()
} timeline: {
    DropWidgetEntry(date: .now)
}
