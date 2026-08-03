package com.cpmentor.method.service;

import com.cpmentor.method.dto.MasteryDTOs.MasteryResponse;
import com.cpmentor.method.dto.MasteryDTOs.PatternMasteryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

// Phase F shareable stat card — hand-drawn via java.awt.Graphics2D (JDK
// built-in, zero new dependencies, consistent with the project's
// free-hosting constraint). Logical fonts only (Font.MONOSPACED /
// Font.SANS_SERIF) since Render's JRE image can't be assumed to have
// JetBrains Mono/Inter installed as system fonts.
@Service
@RequiredArgsConstructor
public class ShareCardService {

    private static final int WIDTH = 800;
    private static final int HEIGHT = 450;
    private static final Color SURFACE_0 = new Color(0x0A, 0x0A, 0x0A);
    private static final Color SURFACE_1 = new Color(0x14, 0x14, 0x14);
    private static final Color ACCENT = new Color(0xC7, 0xF2, 0x84);
    private static final Color TEXT_PRIMARY = new Color(0xF2, 0xF2, 0xF2);
    private static final Color TEXT_MUTED = new Color(0x8A, 0x8A, 0x8A);

    public byte[] renderCard(String username, MasteryResponse mastery) throws IOException {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Background
        g.setColor(SURFACE_0);
        g.fillRect(0, 0, WIDTH, HEIGHT);

        // Header
        g.setColor(ACCENT);
        g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 16));
        g.drawString("$ novacode --stats", 40, 48);

        g.setColor(TEXT_PRIMARY);
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 28));
        g.drawString(username, 40, 84);

        // Streak headline
        drawStatBlock(g, 40, 130, "RECALL STREAK", mastery.recallStreak() + " day" + (mastery.recallStreak() == 1 ? "" : "s"), ACCENT);

        // Submissions per accepted
        String subsValue = String.format("%.2f", mastery.submissionsPerAccepted().current());
        drawStatBlock(g, 320, 130, "SUBMISSIONS / ACCEPTED", subsValue + " (target 1.00)", TEXT_PRIMARY);

        // Pattern mastery grid
        g.setColor(TEXT_MUTED);
        g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 13));
        g.drawString("PATTERN MASTERY", 40, 250);

        int tileSize = 22, gap = 6, cols = 20;
        int startX = 40, startY = 266;
        var patterns = mastery.patternMastery();
        for (int i = 0; i < patterns.size(); i++) {
            PatternMasteryDTO p = patterns.get(i);
            int col = i % cols, row = i / cols;
            int x = startX + col * (tileSize + gap);
            int y = startY + row * (tileSize + gap);
            g.setColor(tierColor(p.tier()));
            g.fill(new RoundRectangle2D.Float(x, y, tileSize, tileSize, 5, 5));
        }
        if (patterns.isEmpty()) {
            g.setColor(TEXT_MUTED);
            g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 13));
            g.drawString("No patterns logged yet.", startX, startY + 16);
        }

        // Legend
        int legendY = HEIGHT - 60;
        drawLegendItem(g, 40, legendY, tierColor(com.cpmentor.method.dto.MasteryDTOs.MasteryTier.MASTERED), "Mastered");
        drawLegendItem(g, 190, legendY, tierColor(com.cpmentor.method.dto.MasteryDTOs.MasteryTier.SOLID), "Solid");
        drawLegendItem(g, 320, legendY, tierColor(com.cpmentor.method.dto.MasteryDTOs.MasteryTier.FAMILIAR), "Familiar");
        drawLegendItem(g, 460, legendY, tierColor(com.cpmentor.method.dto.MasteryDTOs.MasteryTier.LEARNING), "Learning");

        // Footer
        g.setColor(TEXT_MUTED);
        g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 12));
        g.drawString("cp-mentor-delta.vercel.app", 40, HEIGHT - 20);

        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return baos.toByteArray();
    }

    private void drawStatBlock(Graphics2D g, int x, int y, String label, String value, Color valueColor) {
        g.setColor(TEXT_MUTED);
        g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 12));
        g.drawString(label, x, y);

        g.setColor(valueColor);
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 30));
        g.drawString(value, x, y + 40);
    }

    private void drawLegendItem(Graphics2D g, int x, int y, Color color, String label) {
        g.setColor(color);
        g.fill(new RoundRectangle2D.Float(x, y - 12, 12, 12, 3, 3));
        g.setColor(TEXT_MUTED);
        g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 12));
        g.drawString(label, x + 18, y - 1);
    }

    private Color tierColor(com.cpmentor.method.dto.MasteryDTOs.MasteryTier tier) {
        return switch (tier) {
            case MASTERED -> ACCENT;
            case SOLID -> new Color(0x4A, 0xDE, 0x80);
            case FAMILIAR -> new Color(0xFB, 0xBF, 0x24);
            case LEARNING -> SURFACE_1;
        };
    }
}
